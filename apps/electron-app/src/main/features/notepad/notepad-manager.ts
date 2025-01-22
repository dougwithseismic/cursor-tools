import { Workspace } from '../workspace/workspace'
import { Notepad, NotepadInfo } from './notepad'
import type { NotepadContext } from './types'
import { DataValidationError, NotepadError } from '../workspace/errors'

/**
 * Structure for notepad data storage.
 */
interface NotepadData {
  /** Version number of the notepad data format */
  notepadDataVersion: number
  /** Map of notepad instances by their IDs */
  notepads: Record<string, NotepadInfo>
}

/**
 * Input parameters for creating a new notepad.
 */
export interface CreateNotepadInput {
  /** Display name for the new notepad */
  name: string
  /** Optional initial content text */
  text?: string
}

/**
 * Validates notepad data structure.
 * @param {unknown} data - The data to validate
 * @returns {data is NotepadData} Type guard indicating if the data is valid
 */
function isValidNotepadData(data: unknown): data is NotepadData {
  if (!data || typeof data !== 'object') return false

  const candidate = data as Partial<NotepadData>
  if (typeof candidate.notepadDataVersion !== 'number') return false
  if (!candidate.notepads || typeof candidate.notepads !== 'object') return false

  return true
}

/**
 * Manages notepad instances within a workspace.
 * Handles notepad creation, retrieval, and lifecycle management.
 *
 * @example
 * ```typescript
 * const manager = new NotepadManager(workspace);
 * const notepad = await manager.createNotepad({ name: 'New Notepad' });
 * const existingNotepad = await manager.getNotepad('notepad-id');
 * const allNotepads = await manager.getAll();
 * ```
 */
export class NotepadManager {
  private static STORAGE_KEY = 'notepadData'

  /**
   * Creates a new NotepadManager instance.
   * @param {Workspace} workspace - The workspace instance for data persistence
   */
  constructor(private readonly workspace: Workspace) {}

  /**
   * Retrieves the current notepad data from storage.
   * Creates default data structure if none exists.
   * @private
   * @returns {Promise<NotepadData>} The current notepad data
   * @throws {DataValidationError} If stored data is invalid
   */
  private async getNotepadData(): Promise<NotepadData> {
    const data = await this.workspace.get<unknown>(NotepadManager.STORAGE_KEY)

    if (!data) {
      return {
        notepadDataVersion: 0,
        notepads: {}
      }
    }

    if (!isValidNotepadData(data)) {
      throw new DataValidationError('Invalid notepad data structure', NotepadManager.STORAGE_KEY)
    }

    return data
  }

  /**
   * Creates a default context for new notepads.
   * Initializes all context fields with empty values.
   * @private
   * @returns {NotepadContext} A new default context object
   */
  private createDefaultContext(): NotepadContext {
    return {
      editTrailContexts: [],
      externalLinks: [],
      fileSelections: [],
      folderSelections: [],
      mentions: {
        diffHistory: [],
        editTrailContexts: {},
        externalLinks: {},
        fileSelections: {},
        folderSelections: {},
        gitDiff: [],
        gitDiffFromBranchToMain: [],
        notepads: {},
        quotes: {},
        selectedCommits: {},
        selectedDocs: {},
        selectedImages: {},
        selectedPullRequests: {},
        selections: {},
        terminalFiles: {},
        terminalSelections: {},
        useContextPicking: [],
        useDiffReview: [],
        useLinterErrors: [],
        useRememberThis: [],
        useWeb: [],
        usesCodebase: []
      },
      notepads: [],
      quotes: [],
      selectedCommits: [],
      selectedDocs: [],
      selectedImages: [],
      selectedPullRequests: [],
      selections: [],
      terminalFiles: [],
      terminalSelections: []
    }
  }

  /**
   * Creates a new notepad with the specified configuration.
   * Initializes the notepad with default context and a single chat tab.
   * @param {CreateNotepadInput} input - Configuration for the new notepad
   * @returns {Promise<Notepad>} The newly created notepad instance
   * @throws {NotepadError} If notepad creation or save fails
   * @throws {DataValidationError} If input validation fails
   */
  async createNotepad(input: CreateNotepadInput): Promise<Notepad> {
    if (!input.name || input.name.trim().length === 0) {
      throw new DataValidationError('Notepad name is required', 'name')
    }

    try {
      const bubbleId = crypto.randomUUID()
      const tabId = crypto.randomUUID()

      const notepadInfo: NotepadInfo = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        text: input.text?.trim() || '',
        createdAt: Date.now(),
        context: this.createDefaultContext(),
        bottomRightPanePercentage: 25,
        verticalTopPanePercentage: 75,
        inputBoxDelegate: { e: false },
        inputBoxDelegateMap: {
          [bubbleId]: { e: false }
        },
        shouldShowBottomPane: false,
        tabs: [
          {
            bubbles: [
              {
                context: this.createDefaultContext(),
                id: bubbleId,
                messageType: 2,
                type: 'user'
              }
            ],
            chatTitle: 'New Notepad Chat',
            lastFocusedBubbleId: bubbleId,
            tabId,
            tabState: 'chat'
          }
        ]
      }

      const notepad = new Notepad(this.workspace, notepadInfo)
      await notepad.save()
      return notepad
    } catch (error) {
      throw new NotepadError(
        'Failed to create notepad',
        error instanceof Error ? error.message : undefined
      )
    }
  }

  /**
   * Retrieves a notepad by its ID.
   * @param {string} id - The unique identifier of the notepad
   * @returns {Promise<Notepad | null>} The notepad instance if found, null otherwise
   * @throws {NotepadError} If notepad retrieval fails
   * @throws {DataValidationError} If stored notepad data is invalid
   */
  async getNotepad(id: string): Promise<Notepad | null> {
    if (!id || typeof id !== 'string') {
      throw new DataValidationError('Invalid notepad ID', 'id')
    }

    try {
      const data = await this.getNotepadData()
      const notepadInfo = data.notepads[id]
      if (!notepadInfo) return null
      return new Notepad(this.workspace, notepadInfo)
    } catch (error) {
      if (error instanceof DataValidationError) throw error
      throw new NotepadError(
        `Failed to retrieve notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id
      )
    }
  }

  /**
   * Retrieves all notepads in the workspace.
   * @returns {Promise<Notepad[]>} Array of all notepad instances
   * @throws {NotepadError} If notepad retrieval fails
   * @throws {DataValidationError} If stored notepad data is invalid
   */
  async getAll(): Promise<Notepad[]> {
    try {
      const data = await this.getNotepadData()
      return Object.values(data.notepads).map((info) => new Notepad(this.workspace, info))
    } catch (error) {
      if (error instanceof DataValidationError) throw error
      throw new NotepadError(
        `Failed to retrieve notepads: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Deletes a notepad by its ID.
   * @param {string} id - The unique identifier of the notepad to delete
   * @returns {Promise<boolean>} True if the notepad was found and deleted, false otherwise
   * @throws {NotepadError} If notepad deletion fails
   * @throws {DataValidationError} If notepad ID is invalid
   */
  async deleteNotepad(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new DataValidationError('Invalid notepad ID', 'id')
    }

    try {
      const notepad = await this.getNotepad(id)
      if (!notepad) return false
      return notepad.delete()
    } catch (error) {
      if (error instanceof DataValidationError) throw error
      throw new NotepadError(
        `Failed to delete notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id
      )
    }
  }
}
