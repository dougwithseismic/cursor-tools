import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { NotepadManager } from '../notepad/notepad-manager'
import { DatabaseError, JsonError } from './errors'
import { WorkspaceInfo } from './workspace-manager'

/**
 * Represents a workspace in the Cursor application, providing persistent storage and notepad management.
 * Each workspace corresponds to a SQLite database file and manages data storage through key-value pairs.
 *
 * @example
 * ```typescript
 * const workspace = new Workspace({ workspace: workspaceInfo });
 * await workspace.set('myKey', { data: 'value' });
 * const data = await workspace.get('myKey');
 * ```
 */
export class Workspace {
  public id: string
  public folderPath: string
  public dbPath: string
  public readonly notepadManager: NotepadManager
  private dbConnection: Database | null = null

  /**
   * Creates a new Workspace instance.
   * @param {Object} params - The workspace initialization parameters
   * @param {WorkspaceInfo} params.workspace - The workspace information containing id, paths, and configuration
   */
  constructor({ workspace }: { workspace: WorkspaceInfo }) {
    this.id = workspace.id
    this.folderPath = workspace.folderPath
    this.dbPath = workspace.dbPath
    this.notepadManager = new NotepadManager(this)
  }

  /**
   * Gets or initializes the SQLite database connection.
   * Creates the ItemTable if it doesn't exist.
   * @private
   * @returns {Promise<Database>} The database connection
   * @throws {DatabaseError} If database connection or initialization fails
   */
  private async getDb(): Promise<Database> {
    try {
      if (!this.dbConnection) {
        this.dbConnection = await open({
          filename: this.dbPath,
          driver: sqlite3.Database
        })
        // Ensure table exists
        await this.dbConnection.exec(`
          CREATE TABLE IF NOT EXISTS ItemTable (
            key TEXT PRIMARY KEY,
            value TEXT
          )
        `)
      }
      return this.dbConnection
    } catch (error) {
      throw new DatabaseError(
        'Failed to initialize database connection',
        'initialize',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Retrieves a value from the workspace storage by key.
   * @template T - The expected type of the stored value
   * @param {string} key - The key to look up
   * @returns {Promise<T | null>} The stored value parsed from JSON, or null if not found
   * @throws {DatabaseError} If database query fails
   * @throws {JsonError} If JSON parsing fails
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDb()
      const result = await db.get('SELECT value FROM ItemTable WHERE key = ?', key)
      if (!result) return null

      try {
        return JSON.parse(result.value)
      } catch (error) {
        throw new JsonError(
          `Failed to parse stored value for key '${key}'`,
          'parse',
          error instanceof Error ? error : new Error('Unknown error')
        )
      }
    } catch (error) {
      if (error instanceof JsonError) throw error
      throw new DatabaseError(
        `Failed to retrieve value for key '${key}'`,
        'get',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Stores a value in the workspace storage.
   * @template T - The type of the value being stored
   * @param {string} key - The key under which to store the value
   * @param {T} value - The value to store (will be JSON stringified)
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database operation fails
   * @throws {JsonError} If JSON stringification fails
   */
  async set<T>(key: string, value: T): Promise<void> {
    let jsonValue: string
    try {
      jsonValue = JSON.stringify(value)
    } catch (error) {
      throw new JsonError(
        `Failed to stringify value for key '${key}'`,
        'stringify',
        error instanceof Error ? error : new Error('Unknown error')
      )
    }

    try {
      const db = await this.getDb()
      await db.run('INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)', key, jsonValue)
    } catch (error) {
      throw new DatabaseError(
        `Failed to store value for key '${key}'`,
        'set',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Deletes a value from the workspace storage.
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} True if a value was deleted, false if the key didn't exist
   * @throws {DatabaseError} If database operation fails
   */
  async delete(key: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      const result = await db.run('DELETE FROM ItemTable WHERE key = ?', key)
      return (result.changes ?? 0) > 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete value for key '${key}'`,
        'delete',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Checks if a key exists in the workspace storage.
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} True if the key exists, false otherwise
   * @throws {DatabaseError} If database query fails
   */
  async has(key: string): Promise<boolean> {
    try {
      const db = await this.getDb()
      const result = await db.get('SELECT 1 FROM ItemTable WHERE key = ?', key)
      return result !== undefined
    } catch (error) {
      throw new DatabaseError(
        `Failed to check existence of key '${key}'`,
        'has',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Retrieves all keys present in the workspace storage.
   * @returns {Promise<string[]>} Array of all keys in storage
   * @throws {DatabaseError} If database query fails
   */
  async keys(): Promise<string[]> {
    try {
      const db = await this.getDb()
      const results = await db.all('SELECT key FROM ItemTable')
      return results.map((row) => row.key)
    } catch (error) {
      throw new DatabaseError(
        'Failed to retrieve keys',
        'keys',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Clears all data from the workspace storage.
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database operation fails
   */
  async clear(): Promise<void> {
    try {
      const db = await this.getDb()
      await db.run('DELETE FROM ItemTable')
    } catch (error) {
      throw new DatabaseError(
        'Failed to clear storage',
        'clear',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Closes the database connection.
   * Should be called when the workspace is no longer needed.
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database close operation fails
   */
  async close(): Promise<void> {
    if (this.dbConnection) {
      try {
        await this.dbConnection.close()
        this.dbConnection = null
      } catch (error) {
        throw new DatabaseError(
          'Failed to close database connection',
          'close',
          error instanceof Error ? error : undefined
        )
      }
    }
  }
}
