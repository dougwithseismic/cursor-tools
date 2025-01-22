# Debugging Guide for Electron App

## Overview

This guide explains how to debug the Electron application effectively using VSCode's built-in debugging capabilities. Our Electron app consists of two main processes that might need debugging:

1. Main Process (Node.js)
2. Renderer Process (Chrome/Browser)

## When to Debug

### Main Process Debugging

Use main process debugging when you need to:

- Investigate IPC (Inter-Process Communication) issues
- Debug file system operations
- Troubleshoot window management
- Investigate native API integrations
- Debug application lifecycle events

### Renderer Process Debugging

Use renderer process debugging when you need to:

- Debug React component behavior
- Investigate UI-related issues
- Debug state management
- Troubleshoot user interactions
- Investigate rendering performance

## How to Debug

### Setup

The debugging configuration is already set up in `.vscode/launch.json` with three main configurations:

1. **Debug Main Process**: Debugs the Electron main process
2. **Debug Renderer Process**: Debugs the browser/renderer process
3. **Debug All**: Debugs both processes simultaneously

### Starting a Debug Session

1. Open VSCode's Debug view:
   - Windows/Linux: `Ctrl + Shift + D`
   - macOS: `Cmd + Shift + D`

2. Choose your debug configuration:
   - Select "Debug All" for full application debugging
   - Select "Debug Main Process" for main process only
   - Note: "Debug Renderer Process" cannot be started independently

3. Start debugging:
   - Press F5 or click the green play button
   - Use the debug toolbar to control execution

### Using Breakpoints

1. **Setting Breakpoints**
   - Click the left margin of any line to set a breakpoint
   - Or press F9 on the current line
   - Red dots indicate active breakpoints

2. **Conditional Breakpoints**
   - Right-click the left margin
   - Select "Add Conditional Breakpoint"
   - Enter your condition (e.g., `count > 5`)

### Debug Controls

- **Continue** (F5): Resume execution
- **Step Over** (F10): Execute current line
- **Step Into** (F11): Step into function calls
- **Step Out** (Shift+F11): Complete current function
- **Restart** (Ctrl+Shift+F5): Restart debugging
- **Stop** (Shift+F5): End debug session

### Debug Console

Access the Debug Console (Ctrl+Shift+Y) to:

- View console.log outputs
- Evaluate expressions
- Inspect variables
- Execute commands in context

## Tips and Best Practices

1. **Source Maps**
   - Source maps are enabled by default
   - Allows debugging TypeScript directly
   - No need to debug transpiled code

2. **Performance Considerations**
   - Use logging sparingly in production
   - Remove breakpoints after debugging
   - Consider using performance profiling for optimization

3. **Common Debugging Scenarios**

   ```typescript
   // Example: Debugging IPC communication
   ipcMain.on('message', (event, data) => {
     // Set breakpoint here to inspect incoming messages
     console.log('Received:', data);  // Viewable in Debug Console
   });

   // Example: Debugging window creation
   function createWindow(): void {
     // Set breakpoint here to debug window configuration
     const mainWindow = new BrowserWindow({
       width: 900,
       height: 670
     });
   }
   ```

4. **Troubleshooting**
   - Ensure source maps are generated
   - Check port 9222 is available for renderer debugging
   - Verify the correct Node.js version is being used

## Additional Resources

- [Electron Debugging Documentation](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process)
- [VSCode Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)

## Support

For additional help:

1. Check the issue tracker
2. Review the electron-vite documentation
3. Consult the Electron documentation
