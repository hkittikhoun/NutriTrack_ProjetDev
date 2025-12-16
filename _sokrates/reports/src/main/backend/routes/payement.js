// Charger les variables d'environnement EN PREMIER
require("dotenv").config();

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const router = express.Router();

// Debug pour vérifier les variables d'environnement
console.log("🔍 Environment variables check:");
console.log(
  "STRIPE_SECRET_KEY:",
  process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✅ Loaded" : "❌ Missing"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing"
);

// Initialiser Supabase avec la clé service role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Créer une session de checkout Stripe
router.post("/create-checkout-session", async (req, res) => {
  try {
    const {
      email,
      amount = 500, // 5.00 CAD en centimes
      currency = "cad",
      product_name = "NutriTrack Account Creation",
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Vérifier si l'email existe déjà - Méthode corrigée
    const { data: existingUsers, error: getUserError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .limit(1);

    // Si on ne peut pas accéder à auth.users, on skip cette vérification
    if (getUserError) {
      console.log("Note: Could not check for existing users, proceeding...");
    } else if (existingUsers && existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    // Créer ou récupérer le customer Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          purpose: "nutritrack_registration",
          preferred_locale: "en",
        },
      });
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: product_name,
              description: "One-time payment for lifetime access to NutriTrack",
            },
            unit_amount: amount, // Montant en centimes (500 = 5.00 CAD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/signup?canceled=true`,
      metadata: {
        customer_email: email,
        product_type: "account_registration",
        locale: "en",
      },

      // Forcer l'interface en anglais
      locale: "en",

      // Configuration pour collecter l'adresse (requis au Canada)
      billing_address_collection: "auto",

      // Texte personnalisé en anglais
      custom_text: {
        submit: {
          message: "Your payment will be processed securely by Stripe.",
        },
      },

      // Données du payment intent
      payment_intent_data: {
        metadata: {
          locale: "en",
          country: "CA",
          product: "nutritrack_account",
        },
      },
    });

    console.log(`Checkout session created for ${email}: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      message: error.message,
    });
  }
});

// Vérifier le paiement
router.post("/verify-payment", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        error: "Payment not completed",
        payment_status: session.payment_status,
      });
    }

    // Récupérer les détails du customer
    const customer = await stripe.customers.retrieve(session.customer);

    console.log(`Payment verified for ${customer.email}`);

    res.json({
      success: true,
      customerEmail: customer.email,
      customerId: customer.id,
      paymentStatus: session.payment_status,
      amountPaid: session.amount_total / 100, // Convertir en dollars canadiens
      currency: session.currency,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      message: error.message,
    });
  }
});

// Webhook pour les événements Stripe
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // Vérifier si on a une clé webhook configurée
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("No webhook secret configured - skipping verification");
    return res.json({ received: true });
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(`Payment successful for session: ${session.id}`);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`Payment intent succeeded: ${paymentIntent.id}`);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(`Payment failed: ${failedPayment.id}`);
      break;

    default:
      console.log(`ℹUnhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Route pour récupérer les détails d'un paiement
router.get("/payment-details/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "payment_intent"],
    });

    res.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      created: session.created,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      error: "Failed to fetch payment details",
      message: error.message,
    });
  }
});

module.exports = router;
