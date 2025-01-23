import { Database, open } from 'sqlite'
import sqlite3 from 'sqlite3'
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
  private dbConnections: Map<string, Database> = new Map()

  /**
   * Gets or creates a database connection for the given path
   */
  private async getConnection(dbPath: string): Promise<Database> {
    let connection = this.dbConnections.get(dbPath)
    if (!connection) {
      try {
        connection = await open({
          filename: dbPath,
          driver: sqlite3.Database
        })
        await this.initializeSchema(connection)
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
  private async initializeSchema(db: Database): Promise<void> {
    try {
      await db.exec(`
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
    const db = await this.getConnection(dbPath)
    await db.run('BEGIN TRANSACTION')

    return {
      async commit(): Promise<void> {
        await db.run('COMMIT')
      },
      async rollback(): Promise<void> {
        await db.run('ROLLBACK')
      }
    }
  }

  /**
   * Creates or updates a key-value pair in the database
   */
  public async set<T>(dbPath: string, key: string, value: T): Promise<void> {
    const db = await this.getConnection(dbPath)
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
      await db.run(
        `INSERT INTO ItemTable (key, value, updated_at) 
         VALUES (?, ?, unixepoch()) 
         ON CONFLICT(key) DO UPDATE SET 
         value = excluded.value,
         updated_at = excluded.updated_at`,
        key,
        jsonValue
      )
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
    const db = await this.getConnection(dbPath)

    try {
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
    const db = await this.getConnection(dbPath)

    try {
      const result = await db.run('DELETE FROM ItemTable WHERE key = ?', key)
      return (result.changes ?? 0) > 0
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
    const db = await this.getConnection(dbPath)

    try {
      const result = await db.get('SELECT 1 FROM ItemTable WHERE key = ?', key)
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
    const db = await this.getConnection(dbPath)

    try {
      const results = await db.all('SELECT key FROM ItemTable')
      return results.map((row: { key: string }) => row.key)
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
    const db = await this.getConnection(dbPath)

    try {
      await db.run('DELETE FROM ItemTable')
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
        await connection.close()
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
        await connection.close()
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
      throw new Error('Failed to close all database connections')
    }
  }

  /**
   * Executes a query built by QueryBuilder
   */
  public async query<T = unknown>(dbPath: string, queryBuilder: QueryBuilder): Promise<T[]> {
    const db = await this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      return await db.all(query, ...params)
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'query',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Executes a query and returns a single row
   */
  public async queryOne<T = unknown>(
    dbPath: string,
    queryBuilder: QueryBuilder
  ): Promise<T | null> {
    const db = await this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      const result = await db.get(query, ...params)
      return result || null
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'query_one',
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Executes a query and returns the number of affected rows
   */
  public async execute(dbPath: string, queryBuilder: QueryBuilder): Promise<number> {
    const db = await this.getConnection(dbPath)
    const { query, params } = queryBuilder.build()

    try {
      const result = await db.run(query, ...params)
      return result.changes ?? 0
    } catch (error) {
      throw new DatabaseError(
        `Failed to execute query: ${query}`,
        'execute',
        error instanceof Error ? error : undefined
      )
    }
  }
}
