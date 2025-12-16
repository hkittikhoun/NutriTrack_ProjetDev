/* eslint-disable no-undef */
describe("Paiement - inscription puis succès", () => {
  it("remplit le signup, paie, et affiche la page de succès (email à confirmer)", () => {
    // Étape 1: formulaire d'inscription
    cy.visit("/signup");
    cy.get('[name="email"]').type("test.user@example.com");
    cy.get('[name="password"]').type("Secret123!");
    cy.get('[name="confirmPassword"]').type("Secret123!");
    cy.get('[name="firstName"]').type("Test");
    cy.get('[name="lastName"]').type("User");
    cy.get("#terms-and-conditions").check();

    // Submit -> affiche StripePayment
    cy.contains("button", /continue to payment/i).click();

    // Étape 2: bouton "Pay with Stripe" (composant: StripePayement.jsx)
    cy.contains("button", /pay with stripe/i)
      .should("be.visible")
      .click();
    cy.wait("@createCheckout").its("response.statusCode").should("eq", 200);

    // Redirection vers /payment-success?session_id=...
    cy.location("pathname").should("eq", "/payment-success");
    cy.location("search").should("include", "session_id=cs_test_123");

    // Étape 3: vérification paiement + signup Supabase mockés
    cy.wait("@verifyPayment").its("response.statusCode").should("eq", 200);
    cy.wait("@supabaseSignup").its("response.statusCode").should("eq", 200);

    // UI "email envoyée" (PayementSuccess.jsx)
    cy.contains(/payment successful!/i).should("be.visible");
    cy.contains(/please check your email/i).should("be.visible");
    cy.contains(/go to login|return to home/i).should("be.visible");
  });
});
