import { WorkspaceManager, type WorkspaceInfo } from '../features/workspace/workspace-manager'
import { Workspace } from '../features/workspace/workspace'
import { WorkspaceError } from '../features/workspace/errors'
import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'

export class WorkspaceService {
  private workspaceMap: Map<string, Workspace> = new Map()
  private workspacePath: string

  constructor(private readonly workspaceManager: WorkspaceManager) {
    this.workspacePath = path.join(
      process.platform === 'darwin' ? app.getPath('userData') : app.getPath('appData'),
      'Cursor',
      'User',
      'workspaceStorage'
    )
  }

  public async getWorkspaces(): Promise<WorkspaceInfo[]> {
    const workspaces = await this.workspaceManager.getWorkspaces()
    // Cache workspaces for later use
    workspaces.forEach((workspace) => {
      this.workspaceMap.set(workspace.id, workspace)
    })
    return workspaces.map((workspace) => ({
      id: workspace.id,
      folderPath: workspace.folderPath,
      dbPath: workspace.dbPath
    }))
  }

  public async getWorkspace(id: string): Promise<Workspace | null> {
    // Try to get from cache first
    const cachedWorkspace = this.workspaceMap.get(id)
    if (cachedWorkspace) {
      return cachedWorkspace
    }

    // If not in cache, get from manager
    const workspace = await this.workspaceManager.getWorkspace(id)
    if (workspace) {
      this.workspaceMap.set(id, workspace)
    }
    return workspace
  }

  public async createWorkspace(data: { folderPath: string }): Promise<WorkspaceInfo> {
    try {
      // Create workspace directory
      const workspaceId = crypto.randomUUID()
      const workspacePath = path.join(this.workspacePath, workspaceId)
      await fs.mkdir(workspacePath, { recursive: true })

      // Create workspace.json
      const workspaceJson = {
        folder: `file:///${encodeURIComponent(data.folderPath)}`
      }
      await fs.writeFile(
        path.join(workspacePath, 'workspace.json'),
        JSON.stringify(workspaceJson, null, 2)
      )

      // Create empty database
      const dbPath = path.join(workspacePath, 'state.vscdb')
      await fs.writeFile(dbPath, '')

      // Refresh workspaces
      await this.workspaceManager.initialize()

      const workspace = await this.workspaceManager.getWorkspace(workspaceId)
      if (!workspace) {
        throw new WorkspaceError('Failed to create workspace')
      }

      return {
        id: workspace.id,
        folderPath: workspace.folderPath,
        dbPath: workspace.dbPath
      }
    } catch (error) {
      throw new WorkspaceError(
        `Failed to create workspace: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  public async updateWorkspace(id: string, data: { folderPath: string }): Promise<void> {
    try {
      const workspace = await this.getWorkspace(id)
      if (!workspace) {
        throw new WorkspaceError('Workspace not found')
      }

      const workspacePath = path.join(this.workspacePath, id)
      const workspaceJson = {
        folder: `file:///${encodeURIComponent(data.folderPath)}`
      }

      await fs.writeFile(
        path.join(workspacePath, 'workspace.json'),
        JSON.stringify(workspaceJson, null, 2)
      )

      // Refresh workspaces
      await this.workspaceManager.initialize()
    } catch (error) {
      throw new WorkspaceError(
        `Failed to update workspace: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  public async deleteWorkspace(id: string): Promise<void> {
    try {
      const workspace = await this.getWorkspace(id)
      if (!workspace) {
        throw new WorkspaceError('Workspace not found')
      }

      const workspacePath = path.join(this.workspacePath, id)
      await fs.rm(workspacePath, { recursive: true, force: true })

      // Remove from cache
      this.workspaceMap.delete(id)

      // Refresh workspaces
      await this.workspaceManager.initialize()
    } catch (error) {
      throw new WorkspaceError(
        `Failed to delete workspace: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}
