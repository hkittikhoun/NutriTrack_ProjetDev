import { When } from "@badeball/cypress-cucumber-preprocessor";
import { setLastResponse } from "./common";

When("I GET {string}", (path) => {
  cy.request("GET", path).then(setLastResponse);
});
