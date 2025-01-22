import { vi } from 'vitest'
import type { WorkspaceInfo } from '../renderer/src/types/workspace'

// Mock the window.electron API
declare global {
  interface Window {
    electron: {
      invoke: {
        getWorkspaces: () => Promise<WorkspaceInfo[]>
      }
    }
  }
}

// Set up window.electron mock
Object.defineProperty(window, 'electron', {
  value: {
    invoke: {
      getWorkspaces: vi.fn()
    }
  },
  writable: true
})
