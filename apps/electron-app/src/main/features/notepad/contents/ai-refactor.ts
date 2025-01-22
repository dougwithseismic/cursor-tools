export const aiRefactor = {
  name: 'AI: Code Refactoring',
  text: `Help me refactor this code to improve its quality and maintainability.

  Required Context:
  - Code to be refactored
  - Current pain points or issues
  - Target improvements (performance, readability, etc.)
  - Project's coding standards
  - Any constraints to consider

  Common Refactoring Goals:
  - Apply SOLID principles
  - Reduce complexity
  - Improve type safety
  - Extract reusable components
  - Implement design patterns
  - Enhance error handling
  - Optimize performance

  Example Request:
  "Refactor this React component to:
  - Split into smaller components
  - Move business logic to custom hooks
  - Add proper TypeScript types
  - Implement error boundaries
  - Use modern React patterns"

  Bad Examples:
  "make code better"
  "clean this up"
  "fix the mess"`
}
