export const aiDebug = {
  name: 'AI: Debug Assistance',
  text: `Help me debug this issue in my code.

  Required Information:
  - Code with the issue
  - Expected behavior
  - Actual behavior
  - Error messages (if any)
  - Steps to reproduce
  - Environment details
  - Recent changes

  Debugging Approach:
  1. Identify symptoms and error patterns
  2. Isolate the problem area
  3. Review relevant logs and stack traces
  4. Consider edge cases and race conditions
  5. Test hypotheses systematically
  6. Verify the fix

  Example Request:
  "Debug this API endpoint issue:
  - Returns 500 error intermittently
  - Error occurs under high load
  - Database connection times out
  - Need to implement proper retry logic
  - Stack trace attached below..."

  Bad Examples:
  "it's not working"
  "fix the bug"
  "why does this crash"`
}
