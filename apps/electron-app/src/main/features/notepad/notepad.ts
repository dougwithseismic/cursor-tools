import { Workspace } from '../workspace/workspace'
import type { NotepadContext, NotepadTab } from './types'
import { DataValidationError, NotepadError } from '../workspace/errors'

/**
 * Configuration and state information for a notepad instance.
 */
export interface NotepadInfo {
  /** Unique identifier for the notepad */
  id: string
  /** Display name of the notepad */
  name: string
  /** Content text of the notepad */
  text: string
  /** Timestamp when the notepad was created */
  createdAt: number
  /** Context information for the notepad */
  context: NotepadContext
  /** Percentage of the bottom right pane in the UI */
  bottomRightPanePercentage: number
  /** Percentage of the vertical top pane in the UI */
  verticalTopPanePercentage: number
  /** Input box delegate state */
  inputBoxDelegate: { e: boolean }
  /** Map of input box delegate states by bubble ID */
  inputBoxDelegateMap: { [key: string]: { e: boolean } }
  /** Currently selected tab ID */
  selectedTabId?: string
  /** Whether the bottom pane should be visible */
  shouldShowBottomPane: boolean
  /** Array of tabs in the notepad */
  tabs: NotepadTab[]
}

/**
 * Validates notepad info structure.
 * @param {unknown} info - The info to validate
 * @returns {info is NotepadInfo} Type guard indicating if the info is valid
 */
function isValidNotepadInfo(info: unknown): info is NotepadInfo {
  if (!info || typeof info !== 'object') return false

  const candidate = info as Partial<NotepadInfo>
  if (typeof candidate.id !== 'string') return false
  if (typeof candidate.name !== 'string') return false
  if (typeof candidate.text !== 'string') return false
  if (typeof candidate.createdAt !== 'number') return false
  if (!candidate.context || typeof candidate.context !== 'object') return false
  if (typeof candidate.bottomRightPanePercentage !== 'number') return false
  if (typeof candidate.verticalTopPanePercentage !== 'number') return false
  if (!candidate.inputBoxDelegate || typeof candidate.inputBoxDelegate !== 'object') return false
  if (!candidate.inputBoxDelegateMap || typeof candidate.inputBoxDelegateMap !== 'object')
    return false
  if (typeof candidate.shouldShowBottomPane !== 'boolean') return false
  if (!Array.isArray(candidate.tabs)) return false

  return true
}

/**
 * Represents a notepad in the Cursor application.
 * Manages notepad data persistence and provides methods for updating notepad content.
 *
 * @example
 * ```typescript
 * const notepad = new Notepad(workspace, notepadInfo);
 * await notepad.setName('My Notepad');
 * await notepad.setText('Hello, World!');
 * await notepad.save();
 * ```
 */
export class Notepad {
  private readonly storageKeys = ['notepadData', 'notepad.reactiveStorageId'] as const
  public readonly data: NotepadInfo

  /**
   * Creates a new Notepad instance.
   * @param {Workspace} workspace - The workspace instance for data persistence
   * @param {NotepadInfo} info - Initial notepad configuration
   * @throws {DataValidationError} If notepad info is invalid
   */
  constructor(
    private readonly workspace: Workspace,
    info: NotepadInfo
  ) {
    if (!isValidNotepadInfo(info)) {
      throw new DataValidationError('Invalid notepad info structure', 'notepadInfo')
    }
    this.data = { ...info }
  }

  /**
   * Saves the current notepad state to persistent storage.
   * @returns {Promise<void>}
   * @throws {NotepadError} If save operation fails
   * @throws {DataValidationError} If notepad data becomes invalid
   */
  async save(): Promise<void> {
    if (!isValidNotepadInfo(this.data)) {
      throw new DataValidationError('Invalid notepad data state', 'notepadData')
    }

    try {
      for (const key of this.storageKeys) {
        const data = await this.workspace.get<{
          notepadDataVersion: number
          notepads: Record<string, NotepadInfo>
        }>(key)

        if (!data) continue

        data.notepads[this.data.id] = this.data
        await this.workspace.set(key, data)
      }
    } catch (error) {
      throw new NotepadError(
        `Failed to save notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.data.id
      )
    }
  }

  /**
   * Deletes the notepad from persistent storage.
   * @returns {Promise<boolean>} True if the notepad was successfully deleted from any storage location
   * @throws {NotepadError} If delete operation fails
   */
  async delete(): Promise<boolean> {
    try {
      let success = false

      for (const key of this.storageKeys) {
        const data = await this.workspace.get<{
          notepadDataVersion: number
          notepads: Record<string, NotepadInfo>
        }>(key)

        if (!data || !data.notepads[this.data.id]) continue

        delete data.notepads[this.data.id]
        await this.workspace.set(key, data)
        success = true
      }

      return success
    } catch (error) {
      throw new NotepadError(
        `Failed to delete notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.data.id
      )
    }
  }

  /**
   * Updates the notepad's display name and saves the change.
   * @param {string} name - The new name for the notepad
   * @returns {Promise<void>}
   * @throws {DataValidationError} If name is invalid
   * @throws {NotepadError} If save operation fails
   */
  async setName(name: string): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new DataValidationError('Invalid notepad name', 'name')
    }

    try {
      this.data.name = name.trim()
      await this.save()
    } catch (error) {
      if (error instanceof DataValidationError) throw error
      throw new NotepadError(
        `Failed to update notepad name: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.data.id
      )
    }
  }

  /**
   * Updates the notepad's content text and saves the change.
   * @param {string} text - The new content text
   * @returns {Promise<void>}
   * @throws {DataValidationError} If text is invalid
   * @throws {NotepadError} If save operation fails
   */
  async setText(text: string): Promise<void> {
    if (typeof text !== 'string') {
      throw new DataValidationError('Invalid notepad text', 'text')
    }

    try {
      this.data.text = text
      await this.save()
    } catch (error) {
      if (error instanceof DataValidationError) throw error
      throw new NotepadError(
        `Failed to update notepad text: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.data.id
      )
    }
  }
}
