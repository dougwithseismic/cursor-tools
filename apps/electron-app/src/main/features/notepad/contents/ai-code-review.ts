export const aiCodeReview = {
  name: 'AI: Code Review',
  text: `Help me review this code for quality and best practices.

  Required Information:
  - Code to review
  - Project standards
  - Framework/library versions
  - Performance requirements
  - Security requirements
  - Accessibility needs
  - Testing requirements

  Review Aspects:
  - Code style and formatting
  - Best practices adherence
  - Error handling
  - Type safety
  - Performance implications
  - Security considerations
  - Test coverage
  - Documentation quality

  Example Request:
  "Review this React component:
  - Check hooks usage
  - Verify state management
  - Review prop types
  - Assess accessibility
  - Check error boundaries
  - Review testing approach
  - Performance impact"

  Bad Examples:
  "review this"
  "check my code"
  "is this good?"`
}
