import { useState } from 'react'
import { useWorkspaces } from '../../hooks/use-workspaces'
import { FolderOpen, Plus, Edit, Trash2, Search } from 'lucide-react'
import { WorkspaceForm } from './workspace-form'

export function WorkspaceSidebar(): JSX.Element {
  const { workspaces, selectedWorkspaceId, setSelectedWorkspaceId, deleteWorkspace } =
    useWorkspaces()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteWorkspace(id)
      if (selectedWorkspaceId === id) {
        setSelectedWorkspaceId(workspaces[0]?.id)
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err)
    }
  }

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.folderPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col w-[240px] h-full border-r border-input">
      <div className="flex items-center justify-between px-4 py-2 border-b border-input shrink-0">
        <h2 className="text-xs font-medium uppercase text-muted-foreground">Workspaces</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="px-2 py-2 border-b border-input">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-accent/50">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
        <ul className="flex flex-col gap-1 p-2">
          {filteredWorkspaces.map((workspace) => (
            <li
              key={workspace.id}
              className={`flex items-center justify-between p-2 hover:bg-accent/50 cursor-pointer group rounded-md ${
                selectedWorkspaceId === workspace.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedWorkspaceId(workspace.id)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FolderOpen className="flex-shrink-0 w-4 h-4 text-muted-foreground" />
                <span className="text-xs truncate">{workspace.folderPath.split('/').pop()}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(workspace.id)
                  }}
                  className="p-1 rounded opacity-0 text-primary hover:bg-accent group-hover:opacity-100"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(workspace.id)
                  }}
                  className="p-1 rounded opacity-0 text-destructive hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(isCreating || isEditing) && (
        <WorkspaceForm
          workspaceId={isEditing}
          onClose={() => {
            setIsCreating(false)
            setIsEditing(null)
          }}
        />
      )}
    </div>
  )
}
