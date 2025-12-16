import { Then } from "@badeball/cypress-cucumber-preprocessor";

let lastResponse;

export function setLastResponse(res) {
  lastResponse = res;
}

Then("the response status is 200", () => {
  expect(lastResponse?.status).to.eq(200);
});

Then("the JSON has {string}", (key) => {
  expect(lastResponse?.body).to.have.property(key);
});