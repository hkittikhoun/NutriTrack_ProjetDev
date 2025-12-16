Feature: Health endpoint

  Scenario: GET /api/health returns OK
    When I GET "/api/health"
    Then the response status is 200
    And the JSON has "status"
    And the JSON has "message"