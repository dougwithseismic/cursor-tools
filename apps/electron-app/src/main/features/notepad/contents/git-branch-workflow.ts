export const gitBranchWorkflow = {
  name: 'CMD: Git Branch Workflow',
  text: `Create and manage a feature branch following git best practices.

  Branch Naming Convention:
  <type>/<ticket-number>-<short-description>
  
  Types:
  - feat: New feature
  - fix: Bug fix
  - refactor: Code improvement
  - docs: Documentation
  - test: Test addition/modification
  - chore: Maintenance tasks

  Workflow Steps:
  1. Update main branch
     git checkout main
     git pull origin main
  
  2. Create feature branch
     git checkout -b feat/TICKET-123-short-description
  
  3. Regular commits
     git add .
     git commit -m "feat(scope): descriptive message"
  
  4. Keep branch updated
     git checkout main
     git pull origin main
     git checkout feat/TICKET-123-short-description
     git rebase main
  
  5. Push and create PR
     git push origin feat/TICKET-123-short-description

  Example Request:
  "Create branch for user authentication feature:
  - Ticket: AUTH-456
  - Feature: OAuth implementation
  - Update from main
  - Set up initial files
  - Push to remote"

  Bad Examples:
  "make a branch"
  "new feature branch"
  "branch for auth"`
}
