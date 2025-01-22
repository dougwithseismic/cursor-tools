import { ipcMain } from 'electron'
import type { NotepadService } from '../services/notepad-service'

export function setupNotepadHandlers(notepadService: NotepadService): void {
  ipcMain.handle('notepad:getNotepads', async (_event, workspaceId: string) => {
    return notepadService.getNotepads(workspaceId)
  })

  ipcMain.handle(
    'notepad:createNotepad',
    async (_event, data: { name: string; text: string; workspaceId: string }) => {
      return notepadService.createNotepad(data)
    }
  )

  ipcMain.handle(
    'notepad:updateNotepad',
    async (_event, id: string, data: { name: string; text: string }) => {
      await notepadService.updateNotepad(id, data)
    }
  )

  ipcMain.handle('notepad:deleteNotepad', async (_event, id: string) => {
    await notepadService.deleteNotepad(id)
  })
}
