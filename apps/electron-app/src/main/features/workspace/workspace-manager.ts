import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { Workspace } from './workspace'
import { DatabaseService } from '../../db/database-service'
import { DatabaseError } from './errors'

/**
 * Configuration object for workspace folder structure.
 * Contains the path to the workspace folder.
 */
interface WorkspaceJson {
  folder: string
}

/**
 * Information about a workspace instance.
 * Contains all necessary paths and identifiers for workspace operations.
 */
export interface WorkspaceInfo {
  /** Unique identifier for the workspace */
  id: string
  /** Absolute path to the workspace folder */
  folderPath: string
  /** Path to the SQLite database file */
  dbPath: string
}

/**
 * Manages multiple workspaces in the Cursor application.
 * Handles workspace discovery, initialization, and lifecycle management.
 *
 * The WorkspaceManager is responsible for:
 * - Loading workspaces from the filesystem
 * - Managing workspace instances
 * - Providing access to individual workspaces
 *
 * @example
 * ```typescript
 * const manager = new WorkspaceManager();
 * await manager.initialize();
 * const workspaces = await manager.getWorkspaces();
 * const workspace = await manager.getWorkspace('workspace-id');
 * ```
 */
export class WorkspaceManager {
  private workspaces: Workspace[]
  private workspacePath: string
  private readonly dbService: DatabaseService

  /**
   * Creates a new WorkspaceManager instance.
   * Initializes the workspace storage path in the user's app data directory.
   *
   * @throws {Error} If unable to access app data directory
   */
  constructor() {
    this.workspaces = []
    this.workspacePath = path.join(
      process.platform === 'darwin' ? app.getPath('userData') : app.getPath('appData'),
      'Cursor',
      'User',
      'workspaceStorage'
    )
    this.dbService = new DatabaseService()
  }

  /**
   * Initializes the workspace manager by loading all available workspaces.
   * Should be called before using any other methods.
   *
   * @returns {Promise<void>}
   * @throws {Error} If workspace loading fails
   */
  async initialize(): Promise<void> {
    try {
      // Ensure workspace directory exists
      await fs.mkdir(this.workspacePath, { recursive: true })
      await this.loadWorkspaces()
    } catch (error) {
      console.error('Failed to initialize workspace manager:', error)
      throw error
    }
  }

  /**
   * Loads all workspaces from the filesystem.
   * Reads workspace configuration files and initializes workspace instances.
   *
   * The loading process:
   * 1. Reads all directories in the workspace path
   * 2. For each directory, attempts to load workspace.json
   * 3. Validates and parses workspace configuration
   * 4. Creates Workspace instances for valid configurations
   *
   * @private
   * @returns {Promise<void>}
   * @throws {Error} If workspace directory cannot be read or workspace loading fails
   */
  private async loadWorkspaces(): Promise<void> {
    try {
      const workspaceDirs = await fs.readdir(this.workspacePath)
      console.log('Found workspace directories:', workspaceDirs)

      const workspaceResults = await Promise.all(
        workspaceDirs.map(async (dir) => {
          if (dir === 'images') return null

          const workspaceDir = path.join(this.workspacePath, dir)
          const workspaceJsonPath = path.join(workspaceDir, 'workspace.json')
          const dbPath = path.join(workspaceDir, 'state.vscdb')

          try {
            // Ensure workspace directory exists
            await fs.mkdir(workspaceDir, { recursive: true })

            // Check if workspace.json exists
            try {
              await fs.access(workspaceJsonPath)
            } catch {
              console.warn(`No workspace.json found for ${dir}`)
              return null
            }

            // Verify database connection with detailed error logging
            try {
              await this.dbService.get(dbPath, 'notepadData')
            } catch (error) {
              console.error('Database verification failed:', {
                workspace: dir,
                dbPath,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
              })

              if (error instanceof DatabaseError) {
                console.error(`Invalid database for workspace ${dir}:`, error)
                return null
              }
            }

            const workspaceJsonContent = await fs.readFile(workspaceJsonPath, 'utf-8')
            const workspaceJson = JSON.parse(workspaceJsonContent) as WorkspaceJson
            const folderPath = decodeURIComponent(workspaceJson.folder.replace('file:///', ''))

            console.log('Loaded workspace:', {
              id: dir,
              folderPath,
              dbPath
            })

            return {
              id: dir,
              folderPath,
              dbPath
            } as WorkspaceInfo
          } catch (error) {
            console.error(`Error loading workspace ${dir}:`, {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            })
            return null
          }
        })
      )

      this.workspaces = workspaceResults
        .filter((workspace): workspace is WorkspaceInfo => workspace !== null)
        .map((workspaceInfo) => new Workspace({ workspace: workspaceInfo }))

      console.log(
        'Initialized workspaces:',
        this.workspaces.map((w) => w.id)
      )
    } catch (error) {
      console.error('Failed to load workspaces:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  /**
   * Retrieves all initialized workspaces.
   * If no workspaces are loaded, attempts to load them first.
   * @returns {Promise<Workspace[]>} Array of workspace instances
   * @throws {Error} If workspace loading fails
   */
  async getWorkspaces(): Promise<Workspace[]> {
    if (this.workspaces.length === 0) {
      await this.loadWorkspaces()
    }
    return this.workspaces
  }

  /**
   * Retrieves a specific workspace by its ID.
   * @param {string} id - The unique identifier of the workspace
   * @returns {Promise<Workspace | null>} The workspace instance if found, null otherwise
   */
  async getWorkspace(id: string): Promise<Workspace | null> {
    return this.workspaces.find((workspace) => workspace.id === id) || null
  }

  /**
   * Closes all workspace connections.
   */
  async close(): Promise<void> {
    await Promise.all(this.workspaces.map((workspace) => workspace.close()))
  }
}
