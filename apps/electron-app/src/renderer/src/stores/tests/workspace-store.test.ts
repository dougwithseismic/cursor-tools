import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkspaceStore } from '../workspace-store'

describe('Workspace Store', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset()
  })

  it('should initialize with default state', () => {
    const state = useWorkspaceStore.getState()
    expect(state.selectedWorkspaceId).toBeNull()
    expect(state.workspaces).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should set selected workspace', () => {
    const { setSelectedWorkspaceId } = useWorkspaceStore.getState()
    setSelectedWorkspaceId('test-id')
    expect(useWorkspaceStore.getState().selectedWorkspaceId).toBe('test-id')
  })

  it('should set workspaces', () => {
    const { setWorkspaces } = useWorkspaceStore.getState()
    const mockWorkspaces = [
      { id: '1', folderPath: '/path/1', dbPath: '/db/1' },
      { id: '2', folderPath: '/path/2', dbPath: '/db/2' }
    ]
    setWorkspaces(mockWorkspaces)
    expect(useWorkspaceStore.getState().workspaces).toEqual(mockWorkspaces)
  })

  it('should set loading state', () => {
    const { setLoading } = useWorkspaceStore.getState()
    setLoading(true)
    expect(useWorkspaceStore.getState().isLoading).toBe(true)
  })

  it('should set error state', () => {
    const { setError } = useWorkspaceStore.getState()
    setError('Test error')
    expect(useWorkspaceStore.getState().error).toBe('Test error')
  })

  it('should reset state', () => {
    const store = useWorkspaceStore.getState()
    store.setSelectedWorkspaceId('test-id')
    store.setWorkspaces([{ id: '1', folderPath: '/path/1', dbPath: '/db/1' }])
    store.setLoading(true)
    store.setError('Test error')
    store.reset()

    const state = useWorkspaceStore.getState()
    expect(state.selectedWorkspaceId).toBeNull()
    expect(state.workspaces).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})
