Feature: Payment details

  Scenario: GET /api/payment-details/:sessionId returns payment info
    Given a checkout session exists for "test.user@example.com"
    When I GET payment details for that sessionId
    Then the response status is 200
    And the JSON has "payment_status"
    And the JSON has "currency"