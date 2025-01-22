export const aiUnitTest = {
  name: 'AI: Generate Unit Tests',
  text: `Help me write comprehensive unit tests for my code.

  Required Information:
  - Code to test (function/class/module)
  - Expected behavior and edge cases
  - Testing framework being used (Jest, Vitest, etc.)
  - Any mocking requirements

  Test Structure Guidelines:
  1. Arrange: Set up test data and conditions
  2. Act: Execute the code being tested
  3. Assert: Verify the results

  Include tests for:
  - Happy path (expected usage)
  - Edge cases and error conditions
  - Input validation
  - Integration points
  - Performance requirements (if any)

  Example Request:
  "Write unit tests for this authentication service:
  - Test successful login
  - Test invalid credentials
  - Test rate limiting
  - Test token expiration
  - Mock external auth provider"

  Bad Examples:
  "test this code"
  "write some tests"
  "check if it works"`
}
