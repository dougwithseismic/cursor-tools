import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Versions from './components/versions'
import { WorkspaceList } from './components/workspace-list'
import { WorkspaceLayout } from './features/workspace/workspace-layout'

function App(): JSX.Element {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen bg-background">
        {/* Top Bar - Draggable */}
        <header className="flex items-center h-12 px-4 border-b bg-background border-input app-drag-region">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h1 className="font-mono text-xs font-medium uppercase text-foreground">
                Cursor Tools
              </h1>
              <span className="text-2xs text-muted-foreground">by doug@withseismic.com</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            <WorkspaceLayout />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center h-8 px-4 border-t text-2xs bg-background border-input">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Ready</span>
            </div>
            <Versions />
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
