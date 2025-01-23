import { create } from 'zustand'

export interface NotepadContext {
  editTrailContexts: unknown[]
  externalLinks: string[]
  fileSelections: string[]
  folderSelections: string[]
  mentions: {
    diffHistory: string[]
    editTrailContexts: Record<string, unknown>
    externalLinks: Record<string, string>
    fileSelections: Record<string, string>
    folderSelections: Record<string, string>
    gitDiff: string[]
    gitDiffFromBranchToMain: string[]
    notepads: Record<string, unknown>
    quotes: Record<string, string>
    selectedCommits: Record<string, string>
    selectedDocs: Record<string, string>
    selectedImages: Record<string, string>
    selectedPullRequests: Record<string, string>
    selections: Record<string, string>
    terminalFiles: Record<string, string>
    terminalSelections: Record<string, string>
    useContextPicking: string[]
    useDiffReview: string[]
    useLinterErrors: string[]
    useRememberThis: string[]
    useWeb: string[]
    usesCodebase: string[]
  }
  notepads: string[]
  quotes: string[]
  selectedCommits: string[]
  selectedDocs: string[]
  selectedImages: string[]
  selectedPullRequests: string[]
  selections: string[]
  terminalFiles: string[]
  terminalSelections: string[]
}

export interface Notepad {
  id: string
  name: string
  text: string
  createdAt: number
  updatedAt?: number
  workspaceId: string
  context?: NotepadContext
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
