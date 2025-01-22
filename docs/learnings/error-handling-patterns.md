# Learning: Error Handling in TypeScript Monorepo

## Context

We needed to implement robust error handling across a TypeScript monorepo managing workspaces, notepads, and database operations. The goal was to create a consistent, type-safe error handling system that provides clear error messages and proper error propagation.

## Initial Assumptions

- Simple try/catch blocks would be sufficient
- JavaScript's built-in Error class would cover our needs
- Error handling could be added after implementing core functionality
- Error messages didn't need to be structured

## Key Discoveries

1. **Custom Error Hierarchy**
   - **Why it matters:** Enables type-safe error handling and specific error catching
   - **Impact on development:** Improved error tracing and handling across the application
   - **Code examples showing before/after:**

     ```typescript
     // Before: Generic error handling
     try {
       await db.run(query)
     } catch (error) {
       throw new Error(`Database error: ${error.message}`)
     }

     // After: Structured error handling
     try {
       await db.run(query)
     } catch (error) {
       throw new DatabaseError(
         'Failed to execute query',
         'run',
         error instanceof Error ? error : undefined
       )
     }
     ```

2. **Type Guards for Data Validation**
   - **Why it matters:** Prevents invalid data from propagating through the system
   - **Impact on development:** Catches data issues early, making debugging easier
   - **Code examples:**

     ```typescript
     // Before: No validation
     function processNotepad(data: NotepadInfo) {
       // Assume data is valid
       return new Notepad(workspace, data)
     }

     // After: Type guard validation
     function isValidNotepadInfo(info: unknown): info is NotepadInfo {
       if (!info || typeof info !== 'object') return false
       const candidate = info as Partial<NotepadInfo>
       if (typeof candidate.id !== 'string') return false
       // ... more validation
       return true
     }

     function processNotepad(data: unknown) {
       if (!isValidNotepadInfo(data)) {
         throw new DataValidationError('Invalid notepad data', 'notepadInfo')
       }
       return new Notepad(workspace, data)
     }
     ```

## Gotchas

- ⚠️ **Error Wrapping:** Always wrap lower-level errors to maintain the error chain while adding context
- 🔥 **Type Narrowing:** TypeScript doesn't narrow error types automatically in catch blocks
- 💡 **Error Properties:** Custom error classes must explicitly set their name property
- ⚠️ **JSON Handling:** JSON parse/stringify errors need special handling as they can occur in many places
- 🔥 **Database Errors:** SQLite errors need context about the operation that failed

## Code Patterns

### 1. Error Class Hierarchy

```typescript
export class WorkspaceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkspaceError'  // Important!
  }
}

export class DatabaseError extends WorkspaceError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: Error
  ) {
    super(`Database operation '${operation}' failed: ${message}${cause ? ` (${cause.message})` : ''}`)
    this.name = 'DatabaseError'
  }
}
```

### 2. Type Guard Pattern

```typescript
function isValidNotepadData(data: unknown): data is NotepadData {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Partial<NotepadData>
  if (typeof candidate.notepadDataVersion !== 'number') return false
  if (!candidate.notepads || typeof candidate.notepads !== 'object') return false
  return true
}
```

### 3. Error Propagation Pattern

```typescript
async function operation(): Promise<Result> {
  try {
    // ... operation code ...
  } catch (error) {
    if (error instanceof DataValidationError) throw error // Pass through
    throw new OperationError(
      'Operation failed',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
```

## Search Terms

- **Error Hierarchy:** TypeScript error inheritance, custom error classes
- **Type Guards:** TypeScript type predicates, runtime type checking
- **Error Cause:** Error cause property, error chaining
- **SQLite Errors:** SQLite error handling, database error types

## Useful Reading

- 📚 **TypeScript Handbook:** [Error Handling with TypeScript](https://www.typescriptlang.org/docs/handbook/error-handling.html)
- 📝 **Error Cause Proposal:** [TC39 Error Cause](https://github.com/tc39/proposal-error-cause)
- 🔍 **SQLite Error Codes:** [SQLite Error Codes](https://www.sqlite.org/rescode.html)
- 📖 **Type Guards Guide:** [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)

## Next Steps

- **Error Logging:** Implement structured error logging with error types
- **Error Recovery:** Add recovery strategies for common error scenarios
- **Validation Rules:** Create a validation rule system for complex objects
- **Error Boundaries:** Implement React error boundaries for UI error handling
- **Error Monitoring:** Add error tracking and monitoring system

## Best Practices

1. Always extend from a base error class specific to your domain
2. Include relevant context in error messages
3. Use type guards to validate data at boundaries
4. Maintain the error chain using the cause property
5. Add specific properties to error classes for additional context
6. Use descriptive error names that match the class name
7. Document error types in function signatures
8. Handle both Error and unknown error types
9. Validate data before operations, not after
10. Keep error messages user-friendly but detailed
