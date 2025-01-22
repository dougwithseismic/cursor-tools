import { useWorkspaces } from '../../hooks/use-workspaces'
import { NotepadList } from '../../components/notepad-list'

export function WorkspaceContent(): JSX.Element {
  const { selectedWorkspaceId } = useWorkspaces()

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {selectedWorkspaceId && <NotepadList workspaceId={selectedWorkspaceId} />}
      {!selectedWorkspaceId && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Select a workspace to view notepads</p>
        </div>
      )}
    </div>
  )
}
