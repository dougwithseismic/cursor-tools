import type { Notepad } from '../stores/notepad-store'

export interface WorkspaceInfo {
  id: string
  folderPath: string
  dbPath: string
}

export interface ElectronAPI {
  workspace: {
    getWorkspaces: () => Promise<WorkspaceInfo[]>
    createWorkspace: (data: { folderPath: string }) => Promise<WorkspaceInfo>
    updateWorkspace: (id: string, data: { folderPath: string }) => Promise<void>
    deleteWorkspace: (id: string) => Promise<void>
  }
  notepad: {
    getNotepads: (workspaceId: string) => Promise<Notepad[]>
    createNotepad: (data: { name: string; text: string; workspaceId: string }) => Promise<Notepad>
    updateNotepad: (id: string, data: { name: string; text: string }) => Promise<void>
    deleteNotepad: (id: string) => Promise<void>
  }
}

declare global {
  interface Window {
    readonly electron: ElectronAPI
  }
}
