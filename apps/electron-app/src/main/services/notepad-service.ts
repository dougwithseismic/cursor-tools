import { NotepadError } from '../features/workspace/errors'
import { WorkspaceService } from './workspace-service'
import { NotepadManager } from '../features/notepad/notepad-manager'
import type { Notepad } from '../features/notepad/notepad'
import type { NotepadInfo } from '../features/notepad/notepad'

// Serializable interface for IPC communication
export interface SerializableNotepad {
  id: string
  name: string
  text: string
  createdAt: number
  context: NotepadInfo['context']
  bottomRightPanePercentage: number
  verticalTopPanePercentage: number
  inputBoxDelegate: { e: boolean }
  inputBoxDelegateMap: { [key: string]: { e: boolean } }
  selectedTabId?: string
  shouldShowBottomPane: boolean
  tabs: NotepadInfo['tabs']
}

export class NotepadService {
  private notepadManagers: Map<string, NotepadManager> = new Map()

  constructor(private readonly workspaceService: WorkspaceService) {}

  private toSerializable(notepad: Notepad): SerializableNotepad {
    return {
      ...notepad.data
    }
  }

  private async getNotepadManager(workspaceId: string): Promise<NotepadManager> {
    let manager = this.notepadManagers.get(workspaceId)
    if (!manager) {
      const workspace = await this.workspaceService.getWorkspace(workspaceId)
      if (!workspace) {
        throw new NotepadError('Workspace not found', workspaceId)
      }
      manager = new NotepadManager(workspace)
      this.notepadManagers.set(workspaceId, manager)
    }
    return manager
  }

  public async getNotepads(workspaceId: string): Promise<SerializableNotepad[]> {
    try {
      const manager = await this.getNotepadManager(workspaceId)
      const notepads = await manager.getAll()
      return notepads.map((notepad) => this.toSerializable(notepad))
    } catch (error) {
      throw new NotepadError(
        `Failed to get notepads: ${error instanceof Error ? error.message : 'Unknown error'}`,
        workspaceId
      )
    }
  }

  public async createNotepad(data: {
    name: string
    text: string
    workspaceId: string
  }): Promise<SerializableNotepad> {
    try {
      const manager = await this.getNotepadManager(data.workspaceId)
      const notepad = await manager.createNotepad({
        name: data.name,
        text: data.text
      })
      return this.toSerializable(notepad)
    } catch (error) {
      throw new NotepadError(
        `Failed to create notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data.workspaceId
      )
    }
  }

  public async updateNotepad(id: string, data: { name: string; text: string }): Promise<void> {
    try {
      // Find the workspace that contains this notepad
      const workspaces = await this.workspaceService.getWorkspaces()
      for (const workspaceInfo of workspaces) {
        const manager = await this.getNotepadManager(workspaceInfo.id)
        const notepad = await manager.getNotepad(id)
        if (!notepad) continue

        await notepad.setName(data.name)
        await notepad.setText(data.text)
        return
      }

      throw new NotepadError('Notepad not found', id)
    } catch (error) {
      throw new NotepadError(
        `Failed to update notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id
      )
    }
  }

  public async deleteNotepad(id: string): Promise<void> {
    try {
      // Find the workspace that contains this notepad
      const workspaces = await this.workspaceService.getWorkspaces()
      for (const workspaceInfo of workspaces) {
        const manager = await this.getNotepadManager(workspaceInfo.id)
        const deleted = await manager.deleteNotepad(id)
        if (deleted) return
      }

      throw new NotepadError('Notepad not found', id)
    } catch (error) {
      throw new NotepadError(
        `Failed to delete notepad: ${error instanceof Error ? error.message : 'Unknown error'}`,
        id
      )
    }
  }
}
