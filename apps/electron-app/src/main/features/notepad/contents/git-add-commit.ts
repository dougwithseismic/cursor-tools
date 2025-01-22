export const gitAddCommit = {
  name: 'CMD: Git add .; commit -m',
  text: `Use the command line to run git add . followed by git commit -m "commit message"

  Commit Message Format:
  <type>(<scope>): <description>

  Allowed types:
  - feat: A new feature
  - fix: A bug fix
  - docs: Documentation changes
  - style: Code style changes (formatting, missing semi colons, etc)
  - refactor: Code changes that neither fix a bug nor add a feature
  - perf: Code changes that improve performance
  - test: Adding or modifying tests
  - chore: Changes to build process or auxiliary tools

  The scope is optional and shows what part of the codebase was affected.
  The description should:
  - Use imperative mood ("Add" not "Added")
  - Not capitalize first letter
  - No period at the end
  - Keep under 50 characters

  Examples:
  "feat(auth): add OAuth2 login support"
  "fix(api): handle null response from users endpoint"
  "docs(readme): update installation instructions"
  "refactor(core): simplify error handling logic"

  Bad examples:
  "fixed a bug"
  "Updated stuff."
  "wip on feature"`
}
