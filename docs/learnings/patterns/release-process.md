# Release Process Guide

## Overview

This guide details the step-by-step process for creating and publishing releases of Cursor Tools. Our release process is automated using GitHub Actions and follows semantic versioning.

## Prerequisites

- Git installed and configured
- Access to the repository with push permissions
- Node.js and PNPM installed
- All changes to be released are merged to the main branch

## Version Numbers

We follow [Semantic Versioning](https://semver.org/):

- MAJOR version (x.0.0) - Incompatible API changes
- MINOR version (0.x.0) - New features in a backward compatible manner
- PATCH version (0.0.x) - Backward compatible bug fixes

## Step-by-Step Release Process

### 1. Prepare the Release

```bash
# Ensure you're on the main branch
git checkout main
git pull origin main

# Install dependencies
pnpm install

# Run tests
pnpm test

# Check for version inconsistencies
pnpm check-versions

# Fix any version mismatches
pnpm fix-versions
```

### 2. Update Versions

Update versions in:

- Root `package.json`
- `apps/electron-app/package.json`

Example for version 0.2.0:

```bash
# From the root directory
cd apps/electron-app
pnpm version 0.2.0
cd ../..
pnpm version 0.2.0
```

### 3. Update CHANGELOG.md

Add a new section at the top of CHANGELOG.md:

```markdown
## [0.2.0] - YYYY.MM.DD

### Added
- List new features

### Changed
- List changes in existing functionality

### Deprecated
- List soon-to-be removed features

### Removed
- List removed features

### Fixed
- List bug fixes

### Security
- List security improvements
```

### 4. Commit Changes

```bash
# Stage all changes
git add .

# Commit with a standardized message
git commit -m "chore: prepare v0.2.0 release"
```

### 5. Create and Push Tag

```bash
# Create tag
git tag v0.2.0

# Push changes and tag
git push origin main
git push origin v0.2.0
```

### 6. Monitor Release Build

1. Go to GitHub repository
2. Click "Actions" tab
3. Monitor the release workflow
4. Verify all platforms build successfully

The GitHub Action will automatically:

- Build the app for Windows, macOS, and Linux
- Create a GitHub release
- Upload installers as assets
- Generate release notes

### 7. Verify Release

After the workflow completes:

1. Go to GitHub Releases
2. Verify all assets are present:
   - Windows (.exe)
   - macOS (.dmg)
   - Linux (.AppImage, .deb)
3. Test installers if possible
4. Check release notes are correct

## Troubleshooting

### Common Issues

1. Version Mismatch

   ```bash
   # Check versions
   pnpm check-versions
   
   # Fix mismatches
   pnpm fix-versions
   ```

2. Failed Builds
   - Check Actions logs
   - Verify electron-builder config
   - Check code signing (if enabled)

3. Missing Assets
   - Verify GitHub Action workflow
   - Check artifact upload steps
   - Ensure proper permissions

## Post-Release

1. Verify installation on each platform
2. Update documentation if needed
3. Announce release (if public)
4. Create next milestone/sprint

## Emergency Fixes

If issues are found after release:

1. Create hotfix branch

   ```bash
   git checkout -b hotfix/v0.2.1
   ```

2. Fix issues and test thoroughly

3. Follow regular release process with patch version

## Release Checklist

- [ ] All tests passing
- [ ] Versions synchronized
- [ ] CHANGELOG.md updated
- [ ] Git tag created and pushed
- [ ] GitHub Action completed successfully
- [ ] All assets uploaded
- [ ] Release notes accurate
- [ ] Installation tested
- [ ] Documentation updated
