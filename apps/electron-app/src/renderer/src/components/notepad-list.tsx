import { useState } from 'react'
import { useNotepads } from '../hooks/use-notepads'
import { Plus } from 'lucide-react'
import { Notepad } from './notepad'

interface NotepadListProps {
  workspaceId: string
}

interface Notepad {
  id: string
  name: string
  text: string
  createdAt: number
}

export function NotepadList({ workspaceId }: NotepadListProps): JSX.Element {
  const { notepads, isLoading, error, createNotepad, updateNotepad, deleteNotepad } =
    useNotepads(workspaceId)
  const [newNotepad, setNewNotepad] = useState({ name: '', text: '' })
  const [editingNotepad, setEditingNotepad] = useState<Notepad | null>(null)

  const handleCreateNotepad = async (): Promise<void> => {
    try {
      await createNotepad({ name: newNotepad.name, text: newNotepad.text })
      setNewNotepad({ name: '', text: '' })
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleUpdateNotepad = async (notepad: Notepad): Promise<void> => {
    try {
      await updateNotepad({ id: notepad.id, name: notepad.name, text: notepad.text })
      setEditingNotepad(null)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleDeleteNotepad = async (notepadId: string): Promise<void> => {
    try {
      await deleteNotepad(notepadId)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-input shrink-0">
        <h2 className="text-xs font-medium uppercase text-muted-foreground">
          Notepads ({notepads.length})
        </h2>
        <button
          onClick={() => setNewNotepad({ name: '', text: '' })}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <div className="flex flex-col h-full gap-4 p-4 pb-0 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
          {/* Create/Edit Form */}
          {(newNotepad.name !== '' || editingNotepad) && (
            <div className="shrink-0">
              <div className="p-4 border rounded-lg bg-card">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-medium text-card-foreground"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={editingNotepad?.name || newNotepad.name}
                      onChange={(e) =>
                        editingNotepad
                          ? setEditingNotepad({ ...editingNotepad, name: e.target.value })
                          : setNewNotepad({ ...newNotepad, name: e.target.value })
                      }
                      className="block w-full mt-1 text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="text"
                      className="block text-xs font-medium text-card-foreground"
                    >
                      Content
                    </label>
                    <textarea
                      id="text"
                      rows={4}
                      value={editingNotepad?.text || newNotepad.text}
                      onChange={(e) =>
                        editingNotepad
                          ? setEditingNotepad({ ...editingNotepad, text: e.target.value })
                          : setNewNotepad({ ...newNotepad, text: e.target.value })
                      }
                      className="block w-full mt-1 text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        editingNotepad ? handleUpdateNotepad(editingNotepad) : handleCreateNotepad()
                      }
                      disabled={isLoading}
                      className="px-3 py-1 text-xs font-medium border border-transparent rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      {editingNotepad ? 'Save' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotepad(null)
                        setNewNotepad({ name: '', text: '' })
                      }}
                      className="px-3 py-1 text-xs font-medium border rounded-md text-card-foreground bg-card border-input hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="shrink-0">
              <div className="p-4 rounded-md text-destructive-foreground bg-destructive">
                {error}
              </div>
            </div>
          )}

          {/* Notepads Grid */}
          <div className="grid grid-cols-1 gap-4">
            {notepads.map((notepad) => (
              <Notepad
                key={notepad.id}
                notepad={notepad}
                onEdit={() => setEditingNotepad(notepad)}
                onDelete={() => handleDeleteNotepad(notepad.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
