import Database, { type Database as BetterSQLite3Database } from 'better-sqlite3'
import { DatabaseError, JsonError } from '../features/workspace/errors'
import { QueryBuilder } from '../db/query-builder'

export interface DatabaseConfig {
  dbPath: string
}

export interface DatabaseTransaction {
  commit(): Promise<void>
  rollback(): Promise<void>
}

export class DatabaseService {
  private dbConnections: Map<string, BetterSQLite3Database> = new Map()

  /**
   * Gets or creates a database connection for the given path
   */
  private getConnection(dbPath: string): BetterSQLite3Database {
    let connection = this.dbConnections.get(dbPath)
    if (!connection) {
      try {
        connection = new Database(dbPath)
        this.initializeSchema(connection)
        this.dbConnections.set(dbPath, connection)
      } catch (error) {
        throw new DatabaseError(
          'Failed to initialize database connection',
          'connect',
          error instanceof Error ? error : undefined
        )
      }
    }
    return connection
  }

  /**
   * Initializes the database schema if it doesn't exist
   */
  private initializeSchema(db: BetterSQLite3Database): void {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS ItemTable (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch()),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        );

        CREATE INDEX IF NOT EXISTS idx_item_created_at ON ItemTable(created_at);
        CREATE INDEX IF NOT EXISTS idx_item_updated_at ON ItemTable(updated_at);
      `)
    } catch (error) {
      throw new DatabaseError(
        'Failed to initialize database schema',
        'init_schema',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Begins a new transaction
   */
  public async beginTransaction(dbPath: string): Promise<DatabaseTransaction> {
    const db = this.getConnection(dbPath)
    db.prepare('BEGIN TRANSACTION').run()

    return {
      async commit(): Promise<void> {
        db.prepare('COMMIT').run()
      },
      async rollback(): Promise<void> {
        db.prepare('ROLLBACK').run()
      }
    }
  }

  /**
   * Creates or updates a key-value pair in the database
   */
  public async set<T>(dbPath: string, key: string, value: T): Promise<void> {
    const db = this.getConnection(dbPath)
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
      const stmt = db.prepare(
        `INSERT INTO ItemTable (key, value, updated_at) 
         VALUES (?, ?, unixepoch()) 
         ON CONFLICT(key) DO UPDATE SET 
         value = excluded.value,
         updated_at = excluded.updated_at`
      )
      stmt.run(key, jsonValue)
    } catch (error) {
      throw new DatabaseError(
        `Failed to set key: ${key}`,
        'set',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Retrieves a value from the database by key
   */
  public async get<T>(dbPath: string, key: string): Promise<T | null> {
    const db = this.getConnection(dbPath)

    try {
      const stmt = db.prepare('SELECT value FROM ItemTable WHERE key = ?')
      const result = stmt.get(key) as { value: string } | undefined
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
        `Failed to get key: ${key}`,
        'get',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Deletes a key-value pair from the database
   */
  public async delete(dbPath: string, key: string): Promise<boolean> {
    const db = this.getConnection(dbPath)

    try {
      const stmt = db.prepare('DELETE FROM ItemTable WHERE key = ?')
      const result = stmt.run(key)
      return result.changes > 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete key: ${key}`,
        'delete',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Checks if a key exists in the database
   */
  public async has(dbPath: string, key: string): Promise<boolean> {
    const db = this.getConnection(dbPath)

    try {
      const stmt = db.prepare('SELECT 1 FROM ItemTable WHERE key = ?')
      const result = stmt.get(key)
      return result !== undefined
    } catch (error) {
      throw new DatabaseError(
        `Failed to check key existence: ${key}`,
        'has',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Returns all keys in the database
   */
  public async keys(dbPath: string): Promise<string[]> {
    const db = this.getConnection(dbPath)

    try {
      const stmt = db.prepare('SELECT key FROM ItemTable')
      const results = stmt.all() as { key: string }[]
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
   * Clears all data from the database
   */
  public async clear(dbPath: string): Promise<void> {
    const db = this.getConnection(dbPath)

    try {
      db.prepare('DELETE FROM ItemTable').run()
    } catch (error) {
      throw new DatabaseError(
        'Failed to clear database',
        'clear',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Closes a database connection
   */
  public async close(dbPath: string): Promise<void> {
    const connection = this.dbConnections.get(dbPath)
    if (connection) {
      try {
        connection.close()
        this.dbConnections.delete(dbPath)
      } catch (error) {
        throw new DatabaseError(
          'Failed to close database connection',
          'close',
          error instanceof Error ? error : undefined
        )
      }
    }
  }

  /**
   * Closes all database connections
   */
  public async closeAll(): Promise<void> {
    const errors: Error[] = []

    for (const [dbPath, connection] of this.dbConnections) {
      try {
        connection.close()
      } catch (error) {
        errors.push(
          new DatabaseError(
            `Failed to close database connection for ${dbPath}`,
            'close_all',
            error instanceof Error ? error : undefined
          )
        )
      }
    }

    this.dbConnections.clear()

    if (errors.length > 0) {
      throw new DatabaseError(
        'Failed to close all database connections',
        'close_all',
        new AggregateError(errors)
      )
    }
  }

  /**
   * Executes a query built by QueryBuilder
   */
  public async query<T = unknown>(dbPath: string, queryBuilder: QueryBuilder): Promise<T[]> {
    const db = this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      const stmt = db.prepare(query)
      return stmt.all(...params) as T[]
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'query',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Executes a query and returns a single result
   */
  public async queryOne<T = unknown>(
    dbPath: string,
    queryBuilder: QueryBuilder
  ): Promise<T | null> {
    const db = this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      const stmt = db.prepare(query)
      return (stmt.get(...params) as T) || null
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'query_one',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Executes a query that doesn't return results
   */
  public async execute(dbPath: string, queryBuilder: QueryBuilder): Promise<number> {
    const db = this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      const stmt = db.prepare(query)
      const result = stmt.run(...params)
      return result.changes
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'execute',
        error instanceof Error ? error : undefined
      )
    }
  }
}
