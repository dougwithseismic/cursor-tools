export const docsMarkdown = {
  name: 'Docs: Feature Documentation',
  text: `Help me write comprehensive markdown documentation for a feature in /docs.

  Required Information:
  - Feature name and purpose
  - Target audience (developers/users)
  - Related files/modules
  - Dependencies and requirements
  - Configuration options
  - Notable code examples
  - Integration points

  Documentation Structure:
  \`\`\`markdown
  # Feature Name

  Quick Summary (2-3 sentences max)
  - What it does
  - Why it exists
  - Key benefits

  ## Overview
  Detailed explanation with architecture diagrams

  ## Key Components
  - Core modules
  - Helper utilities
  - Integration points
  - Configuration options

  ## Code Examples
  Real examples from the codebase:
  \`\`\`typescript
  // Example from: path/to/file.ts
  function example() {
    // ...
  }
  \`\`\`

  ## Usage Guide
  Step-by-step instructions with code snippets

  ## Related Features
  - Link to related docs
  - Integration examples
  - Common patterns

  ## Notable Code Locations
  - 📁 Core implementation: \\\`path/to/core/\\\`
  - 🔗 Integration points: \\\`path/to/integrations/\\\`
  - 🧪 Test examples: \\\`path/to/tests/\\\`
  - ⚙️ Configuration: \\\`path/to/config/\\\`
  \`\`\`

  Example Request:
  "Document the authentication feature:
  - Title: Authentication System
  - Summary: OAuth2 implementation
  - Code examples from auth/ directory
  - Integration with user service
  - Configuration options
  - Related features: Sessions, Permissions
  - Notable files in auth/, middleware/, config/"

  Bad Examples:
  "write docs"
  "explain the feature"
  "add documentation"
  "make a readme"`
}
