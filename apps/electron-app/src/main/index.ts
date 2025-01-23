import { app, shell, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupWorkspaceHandlers } from './ipc/workspace-handlers'
import { setupNotepadHandlers } from './ipc/notepad-handlers'
import { WorkspaceManager } from './features/workspace/workspace-manager'
import { WorkspaceService } from './services/workspace-service'
import { NotepadService } from './services/notepad-service'
import { TrayManager } from './features/tray/tray'

let mainWindow: BrowserWindow | null = null
let trayManager: TrayManager | null = null
let workspaceManager: WorkspaceManager | null = null

function createWindow(): void {
  // Force dark mode
  nativeTheme.themeSource = 'dark'

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#070809', // HSL(220, 20%, 4%) converted to HEX
    frame: false, // Frameless for all platforms
    ...(process.platform === 'win32'
      ? {
          // Windows specific settings
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#070809',
            symbolColor: '#ffffff',
            height: 30
          }
        }
      : {}),
    ...(process.platform === 'darwin'
      ? {
          // macOS specific settings
          titleBarStyle: 'hiddenInset',
          trafficLightPosition: { x: 10, y: 10 },
          vibrancy: 'under-window',
          visualEffectState: 'active'
        }
      : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.withseismic.cursor-tools')

  // Initialize services
  workspaceManager = new WorkspaceManager()
  await workspaceManager.initialize()

  const workspaceService = new WorkspaceService(workspaceManager)
  const notepadService = new NotepadService(workspaceService)

  // Set up IPC handlers
  setupWorkspaceHandlers(workspaceService)
  setupNotepadHandlers(notepadService)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // Initialize tray after window creation
  if (mainWindow) {
    trayManager = new TrayManager(mainWindow)
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Handle cleanup before quit
app.on('before-quit', async () => {
  // Prevent new quit attempts while we're cleaning up
  app.removeAllListeners('window-all-closed')

  try {
    // Close all database connections
    if (mainWindow) {
      // Destroy tray
      if (trayManager) {
        trayManager.destroy()
      }
      // Close the window
      mainWindow.destroy()
    }
    // Clean up workspace manager
    if (workspaceManager) {
      await workspaceManager.close()
    }
  } catch (error) {
    console.error('Error during app cleanup:', error)
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
