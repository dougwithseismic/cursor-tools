export const tddVitest = {
  name: 'TDD: Red-Green-Refactor with Vitest',
  text: `Guide me through a Test-Driven Development exercise using Vitest to complete this task. Remember to use the latest version of Vitest, mock timers where necessary, and use the latest version of React Testing Library.


  TDD Cycle Steps:
  1. RED: Write Failing Test
     - Write minimal test case
     - Run test (should fail)
     - Verify error message clarity
     - Commit failing test

  2. GREEN: Make Test Pass
     - Write minimal implementation
     - Run test (should pass)
     - No premature optimization
     - Commit passing code

  3. REFACTOR: Improve Code
     - Improve implementation
     - Maintain test passing
     - Apply patterns/standards
     - Commit improvements

  Example Request:
  "TDD a user validation function:
  - Start with email validation test
  - Run test (expect RED)
  - Implement validation
  - Verify test passes (GREEN)
  - Refactor for reusability
  - Add password validation
  - Repeat cycle

  Test Command: pnpm test --run"

  Bad Examples:
  "write some tests"
  "implement feature"
  "test this function"`
}
