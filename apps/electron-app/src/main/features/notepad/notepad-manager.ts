import { Workspace } from '../workspace/workspace'
import { Notepad, NotepadInfo } from './notepad'
import type { NotepadContext } from './types'
import { DataValidationError, NotepadError } from '../workspace/errors'

/**
 * Structure for notepad data storage.
 * Defines the format for persisting notepad data in the workspace.
 */
interface NotepadData {
  /** Version number of the notepad data format */
  notepadDataVersion: number
  /** Map of notepad instances by their IDs */
  notepads: Record<string, NotepadInfo>
}

/**
 * Input parameters for creating a new notepad.
 * Required configuration for notepad creation.
 */
export interface CreateNotepadInput {
  /** Display name for the new notepad */
  name: string
  /** Optional initial content text */
  text?: string
}

/**
 * Type guard to validate notepad data structure.
 * Ensures data loaded from storage matches expected format.
 *
 * @param {unknown} data - The data to validate
 * @returns {boolean} True if data matches NotepadData structure
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
 * Key responsibilities:
 * - Creating new notepads with proper initialization
 * - Managing notepad persistence
 * - Retrieving existing notepads
 * - Handling notepad deletion
 * - Maintaining data consistency
 *
 * @example
 * ```typescript
 * const manager = new NotepadManager(workspace);
 *
 * // Create a new notepad
 * const notepad = await manager.createNotepad({
 *   name: 'New Notepad',
 *   text: 'Initial content'
 * });
 *
 * // Get all notepads
 * const notepads = await manager.getAll();
 *
 * // Get a specific notepad
 * const existingNotepad = await manager.getNotepad('notepad-id');
 *
 * // Delete a notepad
 * await manager.deleteNotepad('notepad-id');
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
   *
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
   *
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
   *
   * The creation process:
   * 1. Validates input parameters
   * 2. Generates unique IDs for notepad components
   * 3. Creates initial notepad structure
   * 4. Persists the notepad to storage
   *
   * @param {CreateNotepadInput} input - Configuration for the new notepad
   * @returns {Promise<Notepad>} The newly created notepad instance
   * @throws {NotepadError} If notepad creation or save fails
   * @throws {DataValidationError} If input validation fails
   *
   * @example
   * ```typescript
   * const notepad = await manager.createNotepad({
   *   name: 'Project Notes',
   *   text: 'Initial project planning'
   * });
   * ```
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
   * Returns null if no notepad exists with the given ID.
   *
   * @param {string} id - The unique identifier of the notepad
   * @returns {Promise<Notepad | null>} The notepad instance if found, null otherwise
   * @throws {NotepadError} If notepad retrieval fails
   * @throws {DataValidationError} If stored notepad data is invalid
   *
   * @example
   * ```typescript
   * const notepad = await manager.getNotepad('notepad-123');
   * if (notepad) {
   *   await notepad.setText('Updated content');
   * }
   * ```
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
   * Loads and validates notepad data from storage.
   *
   * @returns {Promise<Notepad[]>} Array of all notepad instances
   * @throws {NotepadError} If notepad retrieval fails
   * @throws {DataValidationError} If stored notepad data is invalid
   *
   * @example
   * ```typescript
   * const notepads = await manager.getAll();
   * for (const notepad of notepads) {
   *   console.log(notepad.data.name);
   * }
   * ```
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
   * Removes the notepad from storage if it exists.
   *
   * @param {string} id - The unique identifier of the notepad to delete
   * @returns {Promise<boolean>} True if the notepad was found and deleted, false otherwise
   * @throws {NotepadError} If notepad deletion fails
   * @throws {DataValidationError} If notepad ID is invalid
   *
   * @example
   * ```typescript
   * const wasDeleted = await manager.deleteNotepad('notepad-123');
   * if (wasDeleted) {
   *   console.log('Notepad successfully deleted');
   * }
   * ```
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
