/* eslint-disable no-undef */
describe("Panier - ajouter puis augmenter la quantité à 2", () => {
  beforeEach(() => {
    // login
    cy.visit("/login");
    cy.get("#user").clear().type("hugo@example.com");
    cy.get("#password").clear().type("Secret123!");
    cy.get("form.login-form").submit();
    cy.wait("@supabaseLogin");
  });

  it("ajoute Apple depuis le catalogue puis clique + dans le panier", () => {
    // Aller au catalogue et charger les groupes
    cy.visit("/catalogue");
    cy.wait("@foodGroups");

    // Choisir un groupe pour déclencher la liste
    cy.get("#food-group-select").select("1");
    cy.wait("@foodList");

    // Cliquer sur "Add to Cart" sur la carte Apple
    cy.contains(".food-card", "Apple")
      .should("be.visible")
      .within(() => {
        cy.contains(
          "button, [role=button]",
          /add to cart|ajouter au panier/i
        ).click({ force: true });
      });
    cy.wait("@cartInsert");

    // Ouvrir le panier via le bouton du header
    cy.get(".cart-link > button").should("be.visible").click();

    // Attendre la lecture du panier + kcal
    cy.get(".lmj-cart").should("be.visible");
    cy.wait("@cartList");
    cy.wait("@nutrientEnergy");

    // Vérifier quantité = 1 puis cliquer sur +
    cy.get(".lmj-cart .cart-item")
      .first()
      .within(() => {
        cy.get(".qty-value").should("have.text", "1");
        cy.get('button[aria-label="Increase quantity"]').click();
      });

    // PATCH update attendu, puis quantité = 2
    cy.wait("@cartUpdate")
      .its("response.statusCode")
      .should("be.oneOf", [200, 204]);

    cy.get(".lmj-cart .cart-item")
      .first()
      .within(() => {
        cy.get(".qty-value").should("have.text", "2");
      });
  });
});
