import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron'
import path from 'path'

export class TrayManager {
  private tray: Tray | null = null
  private mainWindow: BrowserWindow

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.init()
  }

  private init(): void {
    // Create tray icon with platform-specific sizes
    const iconPath = path.join(__dirname, '..', '..', '..', 'resources', 'icon.png')
    const trayIcon = nativeImage.createFromPath(iconPath)

    // Set platform-specific icon sizes
    if (process.platform === 'win32') {
      trayIcon.setTemplateImage(false)
      this.tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))
    } else if (process.platform === 'darwin') {
      trayIcon.setTemplateImage(true) // Use template mode for macOS
      this.tray = new Tray(trayIcon.resize({ width: 22, height: 22 }))
    } else {
      // Linux
      this.tray = new Tray(trayIcon.resize({ width: 24, height: 24 }))
    }

    // Set tooltip
    this.tray.setToolTip('Cursor Tools')

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Cursor Tools',
        click: (): void => {
          this.mainWindow.show()
          this.mainWindow.focus()
        }
      },
      {
        label: 'Hide to Tray',
        click: (): void => {
          this.mainWindow.hide()
        }
      },
      { type: 'separator' },
      {
        label: process.platform === 'darwin' ? 'Open at Login' : 'Run at Startup',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (menuItem): void => {
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked,
            openAsHidden: true
          })
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: this.handleQuit.bind(this)
      }
    ])

    // Set context menu
    this.tray.setContextMenu(contextMenu)

    // Handle double click (platform specific)
    if (process.platform === 'win32' || process.platform === 'linux') {
      this.tray.on('double-click', (): void => {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide()
        } else {
          this.mainWindow.show()
          this.mainWindow.focus()
        }
      })
    }

    // Handle window close button
    this.mainWindow.on('close', (event): void => {
      // Prevent the window from closing
      event.preventDefault()
      // Hide it instead
      this.mainWindow.hide()
    })

    // Handle window blur
    this.mainWindow.on('blur', (): void => {
      // Optional: Minimize to tray when losing focus
      // this.mainWindow.hide()
    })
  }

  private async handleQuit(): Promise<void> {
    try {
      // Perform any cleanup needed
      await this.cleanup()
      // Actually quit the app
      app.quit()
    } catch (error) {
      console.error('Error during cleanup:', error)
      // Force quit if cleanup fails
      app.exit(1)
    }
  }

  private async cleanup(): Promise<void> {
    // Add cleanup tasks here, like:
    // - Saving application state
    // - Closing database connections
    // - Cleaning up temporary files
    return Promise.resolve()
  }

  // Public method to destroy tray
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
