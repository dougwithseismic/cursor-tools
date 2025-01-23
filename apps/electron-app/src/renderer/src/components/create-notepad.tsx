import { useState } from 'react'

interface CreateNotepadProps {
  onCreateNotepad: (notepad: { name: string; text: string }) => Promise<void>
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
}

export function CreateNotepad({
  onCreateNotepad,
  isLoading,
  isOpen,
  onClose
}: CreateNotepadProps): JSX.Element {
  const [notepad, setNotepad] = useState({ name: '', text: '' })

  const handleSubmit = async (): Promise<void> => {
    try {
      await onCreateNotepad(notepad)
      setNotepad({ name: '', text: '' })
      onClose()
    } catch (err) {
      // Error is handled by the parent
    }
  }

  if (!isOpen) return <></>

  return (
    <div className="p-4">
      <div className="p-4 border rounded-lg bg-card">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-card-foreground">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={notepad.name}
              onChange={(e) => setNotepad({ ...notepad, name: e.target.value })}
              className="block w-full h-8 mt-1 text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-xs font-medium text-card-foreground">
              Content
            </label>
            <textarea
              id="text"
              rows={4}
              value={notepad.text}
              onChange={(e) => setNotepad({ ...notepad, text: e.target.value })}
              className="block w-full mt-1 text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !notepad.name.trim()}
              className="px-3 py-1 text-xs font-medium border border-transparent rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setNotepad({ name: '', text: '' })
                onClose()
              }}
              className="px-3 py-1 text-xs font-medium border rounded-md text-card-foreground bg-card border-input hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
