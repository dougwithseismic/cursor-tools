import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../renderer/src/types/workspace'

// Expose versions info
const versions = {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
}

contextBridge.exposeInMainWorld('versions', versions)

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  workspace: {
    getWorkspaces: () => ipcRenderer.invoke('workspace:getWorkspaces'),
    createWorkspace: (data) => ipcRenderer.invoke('workspace:createWorkspace', data),
    updateWorkspace: (id, data) => ipcRenderer.invoke('workspace:updateWorkspace', id, data),
    deleteWorkspace: (id) => ipcRenderer.invoke('workspace:deleteWorkspace', id)
  },
  notepad: {
    getNotepads: (workspaceId) => ipcRenderer.invoke('notepad:getNotepads', workspaceId),
    createNotepad: (data) => ipcRenderer.invoke('notepad:createNotepad', data),
    updateNotepad: (id, data) => ipcRenderer.invoke('notepad:updateNotepad', id, data),
    deleteNotepad: (id) => ipcRenderer.invoke('notepad:deleteNotepad', id)
  }
}

contextBridge.exposeInMainWorld('electron', electronAPI)
