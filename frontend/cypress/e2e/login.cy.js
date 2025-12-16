/* eslint-disable no-undef */
describe("Login", () => {
  it("se connecte et quitte /login", () => {
    // Page de connexion
    cy.visit("/login");
    cy.location("pathname").should("eq", "/login");

    // Écrire dans le champ
    cy.get("#user").clear().type("hugo@example.com");
    cy.get("#password").clear().type("Secret123!");

    // Soumettre le formulaire
    cy.get("form.login-form").submit();

    // Tester le login et que la route n'est plus au formulaire
    cy.wait("@supabaseLogin");
    cy.location("pathname").should("not.eq", "/login");
  });
});
