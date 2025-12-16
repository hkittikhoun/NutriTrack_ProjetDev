Feature: Create checkout session

  Scenario: POST /api/create-checkout-session returns sessionId and url
    Given the API is running
    When I POST "/api/create-checkout-session" with email "test.user@example.com"
    Then the response status is 200
    And the JSON has "sessionId"
    And the JSON has "url"