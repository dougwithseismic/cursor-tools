/**
 * Base class for all workspace-related errors.
 * Provides a common foundation for error handling in the workspace system.
 *
 * @extends Error
 * @example
 * ```typescript
 * throw new WorkspaceError('Failed to initialize workspace');
 * ```
 */
export class WorkspaceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkspaceError'
  }
}

/**
 * Error thrown when database operations fail.
 * Provides detailed information about the failed operation and its cause.
 *
 * @extends WorkspaceError
 * @example
 * ```typescript
 * throw new DatabaseError('Connection failed', 'connect', new Error('Network timeout'));
 * ```
 */
export class DatabaseError extends WorkspaceError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cause?: Error
  ) {
    super(
      `Database operation '${operation}' failed: ${message}${cause ? ` (${cause.message})` : ''}`
    )
    this.name = 'DatabaseError'
  }
}

/**
 * Error thrown when data validation fails.
 * Indicates which key or field failed validation and why.
 *
 * @extends WorkspaceError
 * @example
 * ```typescript
 * throw new DataValidationError('Value must be a string', 'name');
 * ```
 */
export class DataValidationError extends WorkspaceError {
  constructor(
    message: string,
    public readonly key: string
  ) {
    super(`Data validation failed for key '${key}': ${message}`)
    this.name = 'DataValidationError'
  }
}

/**
 * Error thrown when JSON parsing or stringifying fails.
 * Provides information about the JSON operation that failed.
 *
 * @extends WorkspaceError
 * @example
 * ```typescript
 * try {
 *   JSON.parse(invalidJson);
 * } catch (error) {
 *   throw new JsonError('Invalid JSON', 'parse', error);
 * }
 * ```
 */
export class JsonError extends WorkspaceError {
  constructor(
    message: string,
    public readonly operation: 'parse' | 'stringify',
    public readonly cause: Error
  ) {
    super(`JSON ${operation} failed: ${message} (${cause.message})`)
    this.name = 'JsonError'
  }
}

/**
 * Error thrown when notepad operations fail.
 * Provides information about the affected notepad and the nature of the failure.
 *
 * @extends WorkspaceError
 * @example
 * ```typescript
 * throw new NotepadError('Failed to save notepad', 'notepad-123');
 * ```
 */
export class NotepadError extends WorkspaceError {
  constructor(
    message: string,
    public readonly notepadId?: string
  ) {
    super(`Notepad operation failed${notepadId ? ` for id '${notepadId}'` : ''}: ${message}`)
    this.name = 'NotepadError'
  }
}
