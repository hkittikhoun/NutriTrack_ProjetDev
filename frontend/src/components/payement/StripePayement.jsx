import { useState } from "react";
import "./StripePayement.css";

export default function StripePayment({
  onPaymentSuccess,
  onPaymentCancel,
  userEmail,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Créer une session de checkout Stripe
      const response = await fetch(
        "http://localhost:3001/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            amount: 500, // 5.00 CAD en centimes
            currency: "cad",
            product_name: "NutriTrack Account Creation",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const session = await response.json();

      // Rediriger vers Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      setError("Payment error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stripe-payment-container">
      <div className="payment-card">
        <h3>Complete Your Registration</h3>
        <div className="payment-details">
          <p className="payment-description">
            To create your NutriTrack account, a one-time payment of{" "}
            <strong>$5.00 CAD</strong> is required.
          </p>

          <div className="features-list">
            <h4>What you get:</h4>
            <ul>
              <li>✓ Access to complete food catalogue</li>
              <li>✓ Calorie and nutrition calculators</li>
              <li>✓ Personalized meal planning</li>
              <li>✓ Progress tracking</li>
              <li>✓ Expert nutrition tips</li>
            </ul>
          </div>

          <div className="payment-amount">
            <span className="amount">$5.00 CAD</span>
            <span className="one-time">One-time payment</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="payment-actions">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="pay-button"
            >
              {loading ? "Processing..." : "Pay with Stripe"}
            </button>

            <button
              onClick={onPaymentCancel}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>

          <div className="security-info">
            <p>Secure payment powered by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
