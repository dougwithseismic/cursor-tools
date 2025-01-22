import { ipcMain } from 'electron'
import type { WorkspaceService } from '../services/workspace-service'

/**
 * Sets up IPC handlers for workspace-related operations.
 * Establishes communication channels between the renderer and main processes for workspace management.
 *
 * Handles the following operations:
 * - Getting all workspaces
 * - Creating new workspaces
 * - Updating existing workspaces
 * - Deleting workspaces
 *
 * @param {WorkspaceService} workspaceService - Service handling workspace business logic
 * @example
 * ```typescript
 * const workspaceService = new WorkspaceService();
 * setupWorkspaceHandlers(workspaceService);
 * ```
 */
export function setupWorkspaceHandlers(workspaceService: WorkspaceService): void {
  /**
   * Handles requests to get all workspaces.
   * Returns an array of workspace information.
   */
  ipcMain.handle('workspace:getWorkspaces', async () => {
    return workspaceService.getWorkspaces()
  })

  /**
   * Handles requests to create a new workspace.
   * Expects a folder path in the request data.
   */
  ipcMain.handle('workspace:createWorkspace', async (_event, data: { folderPath: string }) => {
    return workspaceService.createWorkspace(data)
  })

  /**
   * Handles requests to update an existing workspace.
   * Expects workspace ID and updated folder path.
   */
  ipcMain.handle(
    'workspace:updateWorkspace',
    async (_event, id: string, data: { folderPath: string }) => {
      await workspaceService.updateWorkspace(id, data)
    }
  )

  /**
   * Handles requests to delete a workspace.
   * Expects workspace ID to delete.
   */
  ipcMain.handle('workspace:deleteWorkspace', async (_event, id: string) => {
    await workspaceService.deleteWorkspace(id)
  })
}
