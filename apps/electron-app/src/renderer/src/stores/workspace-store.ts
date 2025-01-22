import { create } from 'zustand'
import type { WorkspaceInfo } from '../types/workspace'

interface WorkspaceState {
  workspaces: WorkspaceInfo[]
  selectedWorkspaceId: string | null
  isLoading: boolean
  error: string | null
  setWorkspaces: (workspaces: WorkspaceInfo[]) => void
  setSelectedWorkspaceId: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  workspaces: [],
  selectedWorkspaceId: null,
  isLoading: false,
  error: null
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  ...initialState,
  setWorkspaces: (workspaces: WorkspaceInfo[]): void => set({ workspaces }),
  setSelectedWorkspaceId: (id: string): void => set({ selectedWorkspaceId: id }),
  setLoading: (isLoading: boolean): void => set({ isLoading }),
  setError: (error: string | null): void => set({ error }),
  reset: (): void => set(initialState)
}))
