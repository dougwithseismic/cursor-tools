import { WorkspaceSidebar } from './workspace-sidebar'
import { WorkspaceContent } from './workspace-content'

export function WorkspaceLayout(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden">
      <WorkspaceSidebar />
      <WorkspaceContent />
    </div>
  )
}
