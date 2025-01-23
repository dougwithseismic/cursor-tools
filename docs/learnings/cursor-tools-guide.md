# Cursor Tools Guide

## Overview

Cursor Tools is an Electron-based desktop application that provides a suite of development tools for enhancing productivity. Built with TypeScript, React, and Electron, it follows a modern architecture pattern with strong typing and error handling.

## Architecture

### Core Technologies

- **Electron**: Powers the desktop application
- **React**: UI framework with TypeScript
- **TanStack Query**: Data fetching and state management
- **SQLite**: Local data storage
- **Tailwind CSS**: Styling with a utility-first approach

### Project Structure

```
cursor-tools/
├── apps/
│   └── electron-app/
│       ├── src/
│       │   ├── main/         # Electron main process
│       │   ├── preload/      # Preload scripts
│       │   └── renderer/     # React application
│       └── package.json
└── package.json
```

## Key Features

### Workspace Management

The application uses a workspace-based system where each workspace:

- Has its own SQLite database
- Manages a collection of notepads
- Maintains isolated state and data

```typescript
interface WorkspaceInfo {
  id: string
  folderPath: string
  dbPath: string
}
```

### IPC Communication

Communication between the main and renderer processes is handled through a strongly-typed API:

```typescript
interface ElectronAPI {
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
```

## Development Workflow

### Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start development:

   ```bash
   pnpm dev:electron
   ```

### Building

```bash
pnpm build
```

### Release Process

1. Update version in package.json files
2. Update CHANGELOG.md
3. Commit changes
4. Create and push a tag:

   ```bash
   git tag v{version}
   git push origin v{version}
   ```

5. GitHub Actions will automatically:
   - Build for all platforms
   - Create a release
   - Upload installers

## Best Practices

### TypeScript

- Use strict typing
- Avoid `any` types
- Create interfaces for data structures
- Use union types for state management

### React

- Use functional components
- Implement proper error boundaries
- Use React Query for data fetching
- Follow the container/presenter pattern

### Error Handling

- Use custom error classes
- Implement proper error boundaries
- Log errors appropriately
- Show user-friendly error messages

### State Management

- Use React Query for server state
- Use Zustand for local state
- Implement proper loading states
- Handle optimistic updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Check file permissions
   - Verify database path
   - Check for locked database

2. IPC Communication Issues
   - Verify preload script
   - Check contextIsolation settings
   - Verify API types

3. Build Issues
   - Clear node_modules
   - Rebuild native dependencies
   - Check electron-builder configuration

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
