import { ElectronAPI } from '@electron-toolkit/preload'

interface WorkspaceInfo {
  uid: string
  workspacePath: string
}

interface WorkspaceAPI {
  getWorkspaces: () => Promise<WorkspaceInfo[]>
  getWorkspaceInfo: (uid: string) => Promise<WorkspaceInfo | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WorkspaceAPI
  }
}
