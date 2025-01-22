/**
 * Represents a file URI in the VSCode format.
 * Used for identifying and locating files in the workspace.
 */
export interface FileUri {
  /** Internal VSCode identifier */
  $mid: number
  /** Path separator identifier */
  _sep: number
  /** External file path */
  external: string
  /** Filesystem path */
  fsPath: string
  /** URI path component */
  path: string
  /** URI scheme (e.g., 'file') */
  scheme: string
}

/**
 * Represents a file selection in the notepad.
 * Used for tracking selected files and their addition context.
 */
export interface FileSelection {
  /** Whether the file was added without being explicitly mentioned */
  addedWithoutMention: boolean
  /** The URI of the selected file */
  uri: FileUri
}

/**
 * Contains all mention-related data in a notepad.
 * Tracks various types of mentions and their associated metadata.
 */
export interface Mentions {
  /** History of diff operations */
  diffHistory: unknown[]
  /** Contexts from edit trails */
  editTrailContexts: Record<string, unknown>
  /** External link references */
  externalLinks: Record<string, unknown>
  /** Selected file ranges and their UUIDs */
  fileSelections: Record<
    string,
    Array<{
      /** Selected range in the file */
      defaultRange: {
        /** Starting column number */
        startColumn: number
        /** Ending column number */
        endColumn: number
        /** Starting line number */
        startLineNumber: number
        /** Ending line number */
        endLineNumber: number
      }
      /** Unique identifier for the selection */
      uuid: string
    }>
  >
  /** Selected folder references */
  folderSelections: Record<string, unknown>
  /** Git diff information */
  gitDiff: unknown[]
  /** Git diff from branch to main */
  gitDiffFromBranchToMain: unknown[]
  /** Referenced notepads */
  notepads: Record<string, unknown>
  /** Text quotes */
  quotes: Record<string, unknown>
  /** Selected git commits */
  selectedCommits: Record<string, unknown>
  /** Selected documentation */
  selectedDocs: Record<string, unknown>
  /** Selected images */
  selectedImages: Record<string, unknown>
  /** Selected pull requests */
  selectedPullRequests: Record<string, unknown>
  /** Text selections */
  selections: Record<string, unknown>
  /** Terminal file references */
  terminalFiles: Record<string, unknown>
  /** Terminal selections */
  terminalSelections: Record<string, unknown>
  /** Context picking usage flags */
  useContextPicking: unknown[]
  /** Diff review usage flags */
  useDiffReview: unknown[]
  /** Linter error usage flags */
  useLinterErrors: unknown[]
  /** Remember this usage flags */
  useRememberThis: unknown[]
  /** Web usage flags */
  useWeb: unknown[]
  /** Codebase usage flags */
  usesCodebase: unknown[]
}

/**
 * Represents the context of a notepad.
 * Contains all contextual information and references used in the notepad.
 */
export interface NotepadContext {
  /** Edit trail context references */
  editTrailContexts: unknown[]
  /** External link references */
  externalLinks: unknown[]
  /** File selection references */
  fileSelections: FileSelection[]
  /** Folder selection references */
  folderSelections: unknown[]
  /** All mention-related data */
  mentions: Mentions
  /** Notepad references */
  notepads: unknown[]
  /** Quote references */
  quotes: unknown[]
  /** Selected commit references */
  selectedCommits: unknown[]
  /** Selected documentation references */
  selectedDocs: unknown[]
  /** Selected image references */
  selectedImages: unknown[]
  /** Selected pull request references */
  selectedPullRequests: unknown[]
  /** Text selection references */
  selections: unknown[]
  /** Terminal file references */
  terminalFiles: unknown[]
  /** Terminal selection references */
  terminalSelections: unknown[]
}

/**
 * Represents a chat bubble in a notepad tab.
 * Contains the message content and associated context.
 */
export interface NotepadBubble {
  /** Context associated with this bubble */
  context: NotepadContext
  /** Unique identifier for the bubble */
  id: string
  /** Type of message (e.g., user, assistant) */
  messageType: number
  /** Message type identifier */
  type: string
}

/**
 * Represents a tab in a notepad.
 * Contains chat bubbles and tab-specific state.
 */
export interface NotepadTab {
  /** Array of chat bubbles in the tab */
  bubbles: NotepadBubble[]
  /** Display title for the chat */
  chatTitle: string
  /** ID of the last focused bubble */
  lastFocusedBubbleId: string
  /** Unique identifier for the tab */
  tabId: string
  /** Current state of the tab */
  tabState: string
}
