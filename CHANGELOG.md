## [0.1.0] - 23.01.2025

### Patch
- 

## [0.1.0] - 23.01.2025

### Minor
- 

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 23.01.2025

### Added

- SQLite database layer with robust error handling and connection management
- Type-safe query builder with support for complex SQL operations
- Notepad creation and management functionality

### Fixed

- Bug where the create notepad modal wouldn't show properly
- Improved form state management in notepad creation

### Technical Improvements

- Added comprehensive database transaction support
- Implemented connection pooling for better performance
- Added type-safe query building with support for:
  - Complex JOIN operations
  - WHERE clause conditions
  - ORDER BY and GROUP BY clauses
  - Parameterized queries for security
- Proper error handling and custom error types
