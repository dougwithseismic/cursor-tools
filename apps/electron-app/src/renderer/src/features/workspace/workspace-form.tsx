import { useState, useEffect } from 'react'
import { useWorkspaces } from '../../hooks/use-workspaces'

interface WorkspaceFormProps {
  workspaceId?: string | null
  onClose: () => void
}

interface WorkspaceFormData {
  folderPath: string
}

export function WorkspaceForm({ workspaceId, onClose }: WorkspaceFormProps): JSX.Element {
  const { workspaces, createWorkspace, updateWorkspace, setSelectedWorkspaceId } = useWorkspaces()
  const [formData, setFormData] = useState<WorkspaceFormData>({ folderPath: '' })

  useEffect(() => {
    if (workspaceId) {
      const workspace = workspaces.find((w) => w.id === workspaceId)
      if (workspace) {
        setFormData({ folderPath: workspace.folderPath })
      }
    }
  }, [workspaceId, workspaces])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      if (workspaceId) {
        await updateWorkspace(workspaceId, formData)
      } else {
        const workspace = await createWorkspace(formData)
        setSelectedWorkspaceId(workspace.id)
      }
      setFormData({ folderPath: '' })
      onClose()
    } catch (err) {
      console.error('Failed to save workspace:', err)
    }
  }

  return (
    <div className="p-2 border rounded-lg bg-card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="folderPath" className="text-xs font-medium text-card-foreground">
            Folder Path
          </label>
          <input
            type="text"
            id="folderPath"
            value={formData.folderPath}
            onChange={(e) => setFormData({ ...formData, folderPath: e.target.value })}
            className="text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-3 py-1 text-xs font-medium border border-transparent rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {workspaceId ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium border rounded-md text-card-foreground bg-card border-input hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
