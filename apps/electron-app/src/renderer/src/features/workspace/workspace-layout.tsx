import { WorkspaceSidebar } from './workspace-sidebar'
import { WorkspaceContent } from './workspace-content'
import Versions from '../../components/versions'

export function WorkspaceLayout(): JSX.Element {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 pb-10 overflow-hidden">
        <WorkspaceSidebar />
        <WorkspaceContent />
      </div>
      <div className="px-4 py-2 border-t shrink-0 border-input">
        <Versions />
      </div>
    </div>
  )
}
