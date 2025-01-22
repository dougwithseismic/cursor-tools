import { vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(),
    on: vi.fn(),
    whenReady: vi.fn().mockResolvedValue(undefined)
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    webContents: {
      send: vi.fn()
    },
    on: vi.fn(),
    show: vi.fn(),
    hide: vi.fn()
  }))
}))

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
