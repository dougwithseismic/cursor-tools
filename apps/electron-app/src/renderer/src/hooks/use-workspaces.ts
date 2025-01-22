import { useCallback, useEffect } from 'react'
import { useWorkspaceStore } from '../stores/workspace-store'
import type { WorkspaceInfo } from '../types/workspace'

export function useWorkspaces(): {
  workspaces: WorkspaceInfo[]
  selectedWorkspaceId: string | null
  isLoading: boolean
  error: string | null
  setSelectedWorkspaceId: (id: string) => void
  createWorkspace: (data: { folderPath: string }) => Promise<WorkspaceInfo>
  updateWorkspace: (id: string, data: { folderPath: string }) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
} {
  const {
    workspaces,
    selectedWorkspaceId,
    isLoading,
    error,
    setWorkspaces,
    setSelectedWorkspaceId,
    setLoading,
    setError
  } = useWorkspaceStore()

  useEffect(() => {
    const fetchWorkspaces = async (): Promise<void> => {
      try {
        setLoading(true)
        const fetchedWorkspaces = await window.electron.workspace.getWorkspaces()
        setWorkspaces(fetchedWorkspaces)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workspaces')
      } finally {
        setLoading(false)
      }
    }

    void fetchWorkspaces()
  }, [setWorkspaces, setLoading, setError])

  const createWorkspace = useCallback(
    async (data: { folderPath: string }): Promise<WorkspaceInfo> => {
      try {
        setLoading(true)
        const workspace = await window.electron.workspace.createWorkspace(data)
        setWorkspaces(await window.electron.workspace.getWorkspaces())
        setError(null)
        return workspace
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create workspace')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [setWorkspaces, setLoading, setError]
  )

  const updateWorkspace = useCallback(
    async (id: string, data: { folderPath: string }): Promise<void> => {
      try {
        setLoading(true)
        await window.electron.workspace.updateWorkspace(id, data)
        setWorkspaces(await window.electron.workspace.getWorkspaces())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update workspace')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [setWorkspaces, setLoading, setError]
  )

  const deleteWorkspace = useCallback(
    async (id: string): Promise<void> => {
      try {
        setLoading(true)
        await window.electron.workspace.deleteWorkspace(id)
        setWorkspaces(await window.electron.workspace.getWorkspaces())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete workspace')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [setWorkspaces, setLoading, setError]
  )

  const selectWorkspace = useCallback(
    (id: string) => {
      setSelectedWorkspaceId(id)
    },
    [setSelectedWorkspaceId]
  )

  return {
    workspaces,
    selectedWorkspaceId,
    isLoading,
    error,
    setSelectedWorkspaceId: selectWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  }
}
