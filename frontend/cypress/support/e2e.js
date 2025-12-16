/* eslint-disable no-undef */
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

import "./commands";

// Mocks globaux pour stabiliser les E2E (Supabase + API backend)
beforeEach(() => {
  // Auth Supabase
  cy.intercept("POST", "https://*.supabase.co/auth/v1/token**", {
    statusCode: 200,
    body: {
      access_token: "fake",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "fake",
      user: { id: "user_1", email: "hugo@example.com" },
    },
  }).as("supabaseLogin");

  cy.intercept("GET", "https://*.supabase.co/auth/v1/user", {
    statusCode: 200,
    body: { user: { id: "user_1", email: "hugo@example.com" } },
  }).as("supabaseGetUser");

  // Catalogue (groupes + foods avec nutriments)
  cy.intercept("GET", "https://*.supabase.co/rest/v1/food_group*", {
    statusCode: 200,
    body: [
      { FoodGroupID: 1, FoodGroupName: "Fruits" },
      { FoodGroupID: 2, FoodGroupName: "Vegetables" },
    ],
  }).as("foodGroups");

  cy.intercept("GET", "https://*.supabase.co/rest/v1/food_name*", (req) => {
    req.reply({
      statusCode: 200,
      body: [
        {
          FoodID: 101,
          FoodDescription: "Apple",
          nutrient_amount: [
            {
              NutrientValue: 52,
              nutrient_name: {
                NutrientSymbol: "kcal",
                NutrientUnit: "kcal",
                NutrientCode: 208,
              },
            },
            {
              NutrientValue: 0.3,
              nutrient_name: {
                NutrientSymbol: "P",
                NutrientUnit: "g",
                NutrientCode: 203,
              },
            },
            {
              NutrientValue: 0.2,
              nutrient_name: {
                NutrientSymbol: "F",
                NutrientUnit: "g",
                NutrientCode: 204,
              },
            },
          ],
        },
        {
          FoodID: 102,
          FoodDescription: "Banana",
          nutrient_amount: [
            {
              NutrientValue: 89,
              nutrient_name: {
                NutrientSymbol: "kcal",
                NutrientUnit: "kcal",
                NutrientCode: 208,
              },
            },
            {
              NutrientValue: 1.1,
              nutrient_name: {
                NutrientSymbol: "P",
                NutrientUnit: "g",
                NutrientCode: 203,
              },
            },
            {
              NutrientValue: 0.3,
              nutrient_name: {
                NutrientSymbol: "F",
                NutrientUnit: "g",
                NutrientCode: 204,
              },
            },
          ],
        },
      ],
    });
  }).as("foodList");

  // Panier (insert/list/update/delete + calories)
  // Insert (ajout via FoodCard)
  cy.intercept("POST", "https://*.supabase.co/rest/v1/cart_items*", {
    statusCode: 201,
    body: [{ id: 1 }],
    headers: { preference: "return=representation" },
  }).as("cartInsert");

  // Lecture (Cart.jsx + hook useCartFoods)
  cy.intercept("GET", "https://*.supabase.co/rest/v1/cart_items*", {
    statusCode: 200,
    body: [
      {
        id: 1,
        quantity: 1,
        food: { FoodID: 101, FoodDescription: "Apple" },
      },
    ],
  }).as("cartList");

  // Calories (NutrientCode 208)
  cy.intercept(
    "GET",
    "https://*.supabase.co/rest/v1/nutrient_amount*",
    (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            FoodID: 101,
            NutrientValue: 52,
            nutrient_name: { NutrientCode: 208 },
          },
          {
            FoodID: 102,
            NutrientValue: 89,
            nutrient_name: { NutrientCode: 208 },
          },
        ],
      });
    }
  ).as("nutrientEnergy");

  // Mise à jour quantité (+/−)
  cy.intercept("PATCH", "https://*.supabase.co/rest/v1/cart_items*", {
    statusCode: 204,
    body: null,
  }).as("cartUpdate");

  // Suppression item (si quantité tombe à 0)
  cy.intercept("DELETE", "https://*.supabase.co/rest/v1/cart_items*", {
    statusCode: 204,
    body: null,
  }).as("cartDelete");

  // Paiement (backend Express)
  cy.intercept("POST", "**/api/create-checkout-session", {
    statusCode: 200,
    body: {
      url: "/payment-success?session_id=cs_test_123",
      sessionId: "cs_test_123",
    },
  }).as("createCheckout");

  cy.intercept("POST", "**/api/verify-payment", {
    statusCode: 200,
    body: {
      success: true,
      customerEmail: "test.user@example.com",
      customerId: "cus_test_123",
      paymentStatus: "paid",
      amountPaid: 5,
      currency: "cad",
    },
  }).as("verifyPayment");

  // Supabase signup (appelé par PayementSuccess.jsx)
  cy.intercept("POST", "https://*.supabase.co/auth/v1/signup", {
    statusCode: 200,
    body: {
      user: { id: "user_2", email: "test.user@example.com" },
      session: null, // force le chemin "emailSent" dans PayementSuccess
    },
  }).as("supabaseSignup");
});
