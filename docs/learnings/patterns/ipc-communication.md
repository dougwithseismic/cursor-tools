# IPC Communication Pattern in Cursor Tools

## Overview

This document describes the Inter-Process Communication (IPC) pattern used in Cursor Tools to enable type-safe communication between the Electron main process and renderer process.

## Key Components

### 1. Type Definitions

```typescript
// Types shared between main and renderer
interface ElectronAPI {
  workspace: {
    getWorkspaces: () => Promise<WorkspaceInfo[]>
    createWorkspace: (data: { folderPath: string }) => Promise<WorkspaceInfo>
    // ... other methods
  }
  notepad: {
    getNotepads: (workspaceId: string) => Promise<Notepad[]>
    // ... other methods
  }
}

// Global window augmentation
declare global {
  interface Window {
    electron: ElectronAPI
  }
}
```

### 2. Preload Script

```typescript
import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  workspace: {
    getWorkspaces: () => ipcRenderer.invoke('workspace:getAll'),
    createWorkspace: (data) => ipcRenderer.invoke('workspace:create', data)
  },
  notepad: {
    getNotepads: (workspaceId) => ipcRenderer.invoke('notepad:getAll', workspaceId)
  }
})
```

### 3. Main Process Handlers

```typescript
import { ipcMain } from 'electron'
import { WorkspaceManager } from './features/workspace/workspace-manager'

export function setupIpcHandlers(workspaceManager: WorkspaceManager) {
  ipcMain.handle('workspace:getAll', () => {
    return workspaceManager.getWorkspaces()
  })

  ipcMain.handle('workspace:create', (_, data) => {
    return workspaceManager.createWorkspace(data)
  })
}
```

## Benefits

- **Type Safety**: Full TypeScript support across processes
- **Security**: Controlled exposure of IPC methods
- **Maintainability**: Centralized API definition
- **IDE Support**: Autocomplete and type checking
- **Error Handling**: Proper error propagation

## Example Implementation

### React Hook Usage

```typescript
import { useQuery } from '@tanstack/react-query'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => window.electron.workspace.getWorkspaces()
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { folderPath: string }) => 
      window.electron.workspace.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    }
  })
}
```

## Important Notes

1. **Security Considerations**
   - Always validate data in the main process
   - Never expose the entire ipcRenderer
   - Use contextIsolation
   - Sanitize inputs and outputs

2. **Error Handling**
   - Wrap IPC calls in try/catch
   - Use custom error classes
   - Propagate errors to UI appropriately
   - Log errors in main process

3. **Performance**
   - Batch operations when possible
   - Consider caching strategies
   - Use proper loading states
   - Handle large data transfers carefully

4. **Testing**
   - Mock IPC calls in tests
   - Test error scenarios
   - Validate type safety
   - Test edge cases
