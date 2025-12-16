import { Given, When } from "@badeball/cypress-cucumber-preprocessor";
import { setLastResponse } from "./common";

Given("the API is running", () => {
  cy.request("/api/health").its("status").should("eq", 200);
});

When("I POST {string} with email {string}", (path, email) => {
  cy.request("POST", path, { email }).then(setLastResponse);
});
