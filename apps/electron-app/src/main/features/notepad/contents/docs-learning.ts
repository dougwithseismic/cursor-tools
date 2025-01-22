export const docsLearning = {
  name: 'Docs: Learning Capture',
  text: `Help me document learnings and insights from this development context.

  Required Information:
  - Topic or feature area
  - Problem being solved
  - Initial assumptions
  - What actually worked
  - What didn't work
  - Key insights gained
  - Time period covered

  Documentation Structure:
  \`\`\`markdown
  # Learning: [Topic]

  ## Context
  Brief explanation of the situation and why this learning is important

  ## Initial Assumptions
  - What we thought was true
  - Why we thought it
  - How these assumptions influenced our approach

  ## Key Discoveries
  What we learned that was different from our assumptions:
  1. Discovery One
     - Why it matters
     - Impact on development
     - Code examples showing before/after

  2. Discovery Two
     - ...

  ## Gotchas
  Things to watch out for:
  - ⚠️ Gotcha 1: Description and workaround
  - 🔥 Gotcha 2: Another issue to be aware of
  - 💡 Tip: Helpful insight for avoiding issues

  ## Code Patterns
  Examples of patterns that emerged:
  \`\`\`typescript
  // Example from: path/to/file.ts
  // Before: What we tried first
  // After: What worked better
  \`\`\`

  ## Search Terms
  Keywords for finding more information:
  - Technical term 1: Brief explanation
  - Technical term 2: What it means in this context
  - Related concepts: How they connect

  ## Useful Reading
  - 📚 Official Docs: [link]
  - 📝 Related Issues: [link]
  - 🔍 Stack Overflow: [link]
  - 📖 Blog Posts: [link]

  ## Next Steps
  - What to investigate further
  - Open questions
  - Potential improvements
  \`\`\`

  Example Request:
  "Document learnings from implementing WebSocket authentication:
  - Initial assumption: Standard JWT would work
  - Discovery: Needed custom token format for WS
  - Gotchas with socket reconnection
  - Pattern for handling auth timeouts
  - Search terms: JWT WebSocket, Socket.IO auth
  - Links to relevant docs and issues
  - Code examples showing evolution"

  Bad Examples:
  "write what I learned"
  "document the process"
  "explain what happened"
  "list some notes"`
}
