import { create } from 'zustand'

export interface Notepad {
  id: string
  name: string
  text: string
  createdAt: number
  updatedAt?: number
  workspaceId: string
}

interface NotepadState {
  notepads: Notepad[]
  isLoading: boolean
  error: string | null
  setNotepads: (notepads: Notepad[]) => void
  addNotepad: (notepad: Notepad) => void
  updateNotepad: (id: string, updates: Partial<Omit<Notepad, 'id' | 'workspaceId'>>) => void
  deleteNotepad: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  notepads: [],
  isLoading: false,
  error: null
}

export const useNotepadStore = create<NotepadState>()((set) => ({
  ...initialState,
  setNotepads: (notepads: Notepad[]): void => set({ notepads }),
  addNotepad: (notepad: Notepad): void =>
    set((state) => ({ notepads: [...state.notepads, notepad] })),
  updateNotepad: (id: string, updates: Partial<Omit<Notepad, 'id' | 'workspaceId'>>): void =>
    set((state) => ({
      notepads: state.notepads.map((notepad) =>
        notepad.id === id ? { ...notepad, ...updates } : notepad
      )
    })),
  deleteNotepad: (id: string): void =>
    set((state) => ({
      notepads: state.notepads.filter((notepad) => notepad.id !== id)
    })),
  setLoading: (isLoading: boolean): void => set({ isLoading }),
  setError: (error: string | null): void => set({ error }),
  reset: (): void => set(initialState)
}))
