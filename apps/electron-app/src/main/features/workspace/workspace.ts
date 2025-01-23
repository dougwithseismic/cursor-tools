import { NotepadManager } from '../notepad/notepad-manager'
import { DatabaseError, JsonError } from './errors'
import { WorkspaceInfo } from './workspace-manager'
import { DatabaseService } from '../../db/database-service'
import { QueryBuilder } from '../../db/query-builder'

/**
 * Represents a workspace in the Cursor application.
 * Provides persistent storage and notepad management functionality.
 *
 * Key features:
 * - SQLite-based persistent storage
 * - Key-value data storage
 * - Notepad management
 * - Error handling with custom error types
 *
 * Each workspace corresponds to a SQLite database file and manages data storage
 * through key-value pairs. The workspace also provides access to notepad
 * management functionality through the notepadManager property.
 *
 * @example
 * ```typescript
 * // Create a workspace
 * const workspace = new Workspace({ workspace: workspaceInfo });
 *
 * // Store data
 * await workspace.set('myKey', { data: 'value' });
 *
 * // Retrieve data
 * const data = await workspace.get('myKey');
 *
 * // Work with notepads
 * const notepad = await workspace.notepadManager.createNotepad({
 *   name: 'New Notepad'
 * });
 * ```
 */
export class Workspace {
  public id: string
  public folderPath: string
  public dbPath: string
  public readonly notepadManager: NotepadManager
  private readonly dbService: DatabaseService

  /**
   * Creates a new Workspace instance.
   * Initializes workspace properties and notepad manager.
   *
   * @param {Object} params - The workspace initialization parameters
   * @param {WorkspaceInfo} params.workspace - Workspace configuration containing id, paths, and settings
   */
  constructor({ workspace }: { workspace: WorkspaceInfo }) {
    this.id = workspace.id
    this.folderPath = workspace.folderPath
    this.dbPath = workspace.dbPath
    this.dbService = new DatabaseService()
    this.notepadManager = new NotepadManager(this)
  }

  /**
   * Retrieves a value from the workspace storage by key.
   * Values are stored as JSON strings and parsed upon retrieval.
   *
   * @template T - The expected type of the stored value
   * @param {string} key - The key to look up
   * @returns {Promise<T | null>} The stored value parsed from JSON, or null if not found
   * @throws {DatabaseError} If database query fails
   * @throws {JsonError} If JSON parsing fails
   *
   * @example
   * ```typescript
   * interface UserData {
   *   name: string;
   *   preferences: Record<string, unknown>;
   * }
   *
   * const userData = await workspace.get<UserData>('userData');
   * if (userData) {
   *   console.log(userData.name);
   * }
   * ```
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const query = new QueryBuilder().select('value').from('ItemTable').where('key = ?', key)

      const result = await this.dbService.queryOne<{ value: string }>(this.dbPath, query)
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
   * Values are JSON stringified before storage.
   *
   * @template T - The type of the value being stored
   * @param {string} key - The key under which to store the value
   * @param {T} value - The value to store
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database operation fails
   * @throws {JsonError} If JSON stringification fails
   *
   * @example
   * ```typescript
   * await workspace.set('userData', {
   *   name: 'John Doe',
   *   preferences: {
   *     theme: 'dark'
   *   }
   * });
   * ```
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
      const query = new QueryBuilder().from('ItemTable').where('key = ?', key)

      const exists = await this.dbService.queryOne(this.dbPath, query)

      if (exists) {
        const updateQuery = new QueryBuilder()
          .from('ItemTable')
          .where('key = ?', key)
          .set('value', jsonValue)
          .set('updated_at', 'unixepoch()')

        await this.dbService.execute(this.dbPath, updateQuery)
      } else {
        const insertQuery = new QueryBuilder().from('ItemTable').insert({
          key,
          value: jsonValue,
          created_at: 'unixepoch()',
          updated_at: 'unixepoch()'
        })

        await this.dbService.execute(this.dbPath, insertQuery)
      }
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
   *
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} True if a value was deleted, false if the key didn't exist
   * @throws {DatabaseError} If database operation fails
   *
   * @example
   * ```typescript
   * const wasDeleted = await workspace.delete('userData');
   * if (wasDeleted) {
   *   console.log('User data successfully deleted');
   * }
   * ```
   */
  async delete(key: string): Promise<boolean> {
    try {
      const query = new QueryBuilder().from('ItemTable').where('key = ?', key).delete()

      const affectedRows = await this.dbService.execute(this.dbPath, query)
      return affectedRows > 0
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
   *
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} True if the key exists, false otherwise
   * @throws {DatabaseError} If database query fails
   *
   * @example
   * ```typescript
   * if (await workspace.has('userData')) {
   *   const userData = await workspace.get('userData');
   * }
   * ```
   */
  async has(key: string): Promise<boolean> {
    try {
      const query = new QueryBuilder().select('1').from('ItemTable').where('key = ?', key)

      const result = await this.dbService.queryOne(this.dbPath, query)
      return result !== null
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
   *
   * @returns {Promise<string[]>} Array of all keys in storage
   * @throws {DatabaseError} If database query fails
   *
   * @example
   * ```typescript
   * const allKeys = await workspace.keys();
   * for (const key of allKeys) {
   *   const value = await workspace.get(key);
   *   console.log(`${key}: ${value}`);
   * }
   * ```
   */
  async keys(): Promise<string[]> {
    try {
      const query = new QueryBuilder().select('key').from('ItemTable').orderBy('created_at')

      const results = await this.dbService.query<{ key: string }>(this.dbPath, query)
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
   *
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database operation fails
   *
   * @example
   * ```typescript
   * // Clear all stored data
   * await workspace.clear();
   * ```
   */
  async clear(): Promise<void> {
    try {
      const query = new QueryBuilder().from('ItemTable').delete()

      await this.dbService.execute(this.dbPath, query)
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
   *
   * @returns {Promise<void>}
   * @throws {DatabaseError} If database close operation fails
   *
   * @example
   * ```typescript
   * // Clean up workspace resources
   * await workspace.close();
   * ```
   */
  async close(): Promise<void> {
    try {
      await this.dbService.close(this.dbPath)
    } catch (error) {
      throw new DatabaseError(
        'Failed to close database connection',
        'close',
        error instanceof Error ? error : undefined
      )
    }
  }
}
