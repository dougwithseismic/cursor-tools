export const aiSecurity = {
  name: 'AI: Security Review',
  text: `Help me review and improve the security of this code.

  Required Information:
  - Code to review
  - Security requirements
  - Authentication method
  - Data sensitivity levels
  - Compliance requirements
  - Known vulnerabilities
  - Threat model

  Security Checklist:
  - Input validation/sanitization
  - Authentication/Authorization
  - Data encryption
  - Session management
  - CSRF protection
  - XSS prevention
  - SQL injection prevention
  - Secure configuration
  - Logging/Monitoring

  Example Request:
  "Review security for this authentication flow:
  - OAuth2 implementation
  - Token storage approach
  - Password hashing method
  - Session management
  - Rate limiting
  - GDPR compliance needs"

  Bad Examples:
  "is this secure?"
  "check security"
  "make it safe"`
}
