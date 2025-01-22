import { ipcMain } from 'electron'
import type { WorkspaceService } from '../services/workspace-service'

export function setupWorkspaceHandlers(workspaceService: WorkspaceService): void {
  ipcMain.handle('workspace:getWorkspaces', async () => {
    return workspaceService.getWorkspaces()
  })

  ipcMain.handle('workspace:createWorkspace', async (_event, data: { folderPath: string }) => {
    return workspaceService.createWorkspace(data)
  })

  ipcMain.handle(
    'workspace:updateWorkspace',
    async (_event, id: string, data: { folderPath: string }) => {
      await workspaceService.updateWorkspace(id, data)
    }
  )

  ipcMain.handle('workspace:deleteWorkspace', async (_event, id: string) => {
    await workspaceService.deleteWorkspace(id)
  })
}
