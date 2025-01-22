import { vi } from 'vitest'
import type { WorkspaceInfo } from '../src/types/workspace'

const mockWorkspaces: WorkspaceInfo[] = [
  { id: '1', folderPath: '/path/1', dbPath: '/db/1' },
  { id: '2', folderPath: '/path/2', dbPath: '/db/2' }
]

// Mock the electron API
const mockElectronAPI = {
  invoke: {
    getWorkspaces: vi.fn().mockResolvedValue(mockWorkspaces)
  },
  handle: {
    getWorkspaces: vi.fn().mockResolvedValue(mockWorkspaces)
  },
  remove: {
    getWorkspaces: vi.fn()
  }
} as const

// Override the window.electron type for tests
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      electron: typeof mockElectronAPI
    }
  }
}

// Add the mock to the global object
globalThis.electron = mockElectronAPI
