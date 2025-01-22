export interface FileUri {
  $mid: number
  _sep: number
  external: string
  fsPath: string
  path: string
  scheme: string
}

export interface FileSelection {
  addedWithoutMention: boolean
  uri: FileUri
}

export interface Mentions {
  diffHistory: unknown[]
  editTrailContexts: Record<string, unknown>
  externalLinks: Record<string, unknown>
  fileSelections: Record<
    string,
    Array<{
      defaultRange: {
        startColumn: number
        endColumn: number
        startLineNumber: number
        endLineNumber: number
      }
      uuid: string
    }>
  >
  folderSelections: Record<string, unknown>
  gitDiff: unknown[]
  gitDiffFromBranchToMain: unknown[]
  notepads: Record<string, unknown>
  quotes: Record<string, unknown>
  selectedCommits: Record<string, unknown>
  selectedDocs: Record<string, unknown>
  selectedImages: Record<string, unknown>
  selectedPullRequests: Record<string, unknown>
  selections: Record<string, unknown>
  terminalFiles: Record<string, unknown>
  terminalSelections: Record<string, unknown>
  useContextPicking: unknown[]
  useDiffReview: unknown[]
  useLinterErrors: unknown[]
  useRememberThis: unknown[]
  useWeb: unknown[]
  usesCodebase: unknown[]
}

export interface NotepadContext {
  editTrailContexts: unknown[]
  externalLinks: unknown[]
  fileSelections: FileSelection[]
  folderSelections: unknown[]
  mentions: Mentions
  notepads: unknown[]
  quotes: unknown[]
  selectedCommits: unknown[]
  selectedDocs: unknown[]
  selectedImages: unknown[]
  selectedPullRequests: unknown[]
  selections: unknown[]
  terminalFiles: unknown[]
  terminalSelections: unknown[]
}

export interface NotepadBubble {
  context: NotepadContext
  id: string
  messageType: number
  type: string
}

export interface NotepadTab {
  bubbles: NotepadBubble[]
  chatTitle: string
  lastFocusedBubbleId: string
  tabId: string
  tabState: string
}
