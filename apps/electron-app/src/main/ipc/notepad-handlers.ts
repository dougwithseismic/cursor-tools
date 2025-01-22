import { ipcMain } from 'electron'
import type { NotepadService } from '../services/notepad-service'

/**
 * Sets up IPC handlers for notepad-related operations.
 * Establishes communication channels between the renderer and main processes for notepad management.
 *
 * Handles the following operations:
 * - Getting all notepads in a workspace
 * - Creating new notepads
 * - Updating existing notepads
 * - Deleting notepads
 *
 * @param {NotepadService} notepadService - Service handling notepad business logic
 * @example
 * ```typescript
 * const notepadService = new NotepadService();
 * setupNotepadHandlers(notepadService);
 * ```
 */
export function setupNotepadHandlers(notepadService: NotepadService): void {
  /**
   * Handles requests to get all notepads in a workspace.
   * Returns an array of notepad information.
   * @param {string} workspaceId - ID of the workspace to get notepads from
   */
  ipcMain.handle('notepad:getNotepads', async (_event, workspaceId: string) => {
    return notepadService.getNotepads(workspaceId)
  })

  /**
   * Handles requests to create a new notepad.
   * Expects notepad name, initial text, and workspace ID.
   */
  ipcMain.handle(
    'notepad:createNotepad',
    async (_event, data: { name: string; text: string; workspaceId: string }) => {
      return notepadService.createNotepad(data)
    }
  )

  /**
   * Handles requests to update an existing notepad.
   * Expects notepad ID and updated name and text.
   */
  ipcMain.handle(
    'notepad:updateNotepad',
    async (_event, id: string, data: { name: string; text: string }) => {
      await notepadService.updateNotepad(id, data)
    }
  )

  /**
   * Handles requests to delete a notepad.
   * Expects notepad ID to delete.
   */
  ipcMain.handle('notepad:deleteNotepad', async (_event, id: string) => {
    await notepadService.deleteNotepad(id)
  })
}
