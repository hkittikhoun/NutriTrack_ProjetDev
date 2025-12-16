import { Given, When } from "@badeball/cypress-cucumber-preprocessor";
import { setLastResponse } from "./common";

let sessionId;

Given("a checkout session exists for {string}", (email) => {
  cy.request("POST", "/api/create-checkout-session", { email }).then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.have.property("sessionId");
    sessionId = res.body.sessionId;
  });
});

When("I GET payment details for that sessionId", () => {
  cy.request({
    method: "GET",
    url: `/api/payment-details/${sessionId}`,
    failOnStatusCode: false,
  }).then(setLastResponse);
});
