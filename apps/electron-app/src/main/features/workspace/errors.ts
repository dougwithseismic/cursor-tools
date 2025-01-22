/**
 * Base class for workspace-related errors.
 */
export class WorkspaceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkspaceError'
  }
}

/**
 * Error thrown when database operations fail.
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
 * Error thrown when JSON parsing/stringifying fails.
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
