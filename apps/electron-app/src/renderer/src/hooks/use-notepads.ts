import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Notepad } from '../stores/notepad-store'

export function useNotepads(workspaceId: string): {
  notepads: Notepad[]
  isLoading: boolean
  error: string | null
  createNotepad: (params: { name: string; text: string }) => Promise<void>
  updateNotepad: (params: { id: string; name: string; text: string }) => Promise<void>
  deleteNotepad: (id: string) => Promise<void>
} {
  const queryClient = useQueryClient()
  const notepadsQueryKey = ['notepads', workspaceId]

  const {
    data: notepads = [],
    isLoading,
    error
  } = useQuery({
    queryKey: notepadsQueryKey,
    queryFn: async () => {
      const fetchedNotepads = await window.electron.notepad.getNotepads(workspaceId)
      return fetchedNotepads
    }
  })

  const createNotepadMutation = useMutation({
    mutationFn: async ({ name, text }: { name: string; text: string }) => {
      return window.electron.notepad.createNotepad({
        name,
        text,
        workspaceId
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notepadsQueryKey })
    }
  })

  const updateNotepadMutation = useMutation({
    mutationFn: async ({ id, name, text }: { id: string; name: string; text: string }) => {
      return window.electron.notepad.updateNotepad(id, { name, text })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notepadsQueryKey })
    }
  })

  const deleteNotepadMutation = useMutation({
    mutationFn: async (id: string) => {
      return window.electron.notepad.deleteNotepad(id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notepadsQueryKey })
    }
  })

  return {
    notepads,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null,
    createNotepad: async ({ name, text }) => {
      await createNotepadMutation.mutateAsync({ name, text })
    },
    updateNotepad: async ({ id, name, text }) => {
      await updateNotepadMutation.mutateAsync({ id, name, text })
    },
    deleteNotepad: async (id) => {
      await deleteNotepadMutation.mutateAsync(id)
    }
  }
}
