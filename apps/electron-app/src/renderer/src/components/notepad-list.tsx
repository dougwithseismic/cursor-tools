import { useState, useRef, useEffect, forwardRef } from 'react'
import { useNotepads } from '../hooks/use-notepads'
import { Plus, Search } from 'lucide-react'
import { Notepad as NotepadComponent } from './notepad'
import { FixedSizeList as List } from 'react-window'
import type { Notepad } from '../stores/notepad-store'

interface NotepadListProps {
  workspaceId: string
}

interface NotepadRowProps {
  index: number
  style: React.CSSProperties
  data: {
    notepads: Notepad[]
    onEdit: (notepad: { id: string; name: string; text: string }) => void
    onDelete: (id: string) => void
    isLoading: boolean
  }
}

// Custom outer element for List with scrollbar styles
const OuterElement = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
  />
))
OuterElement.displayName = 'OuterElement'

const NotepadRow = ({ index, style, data }: NotepadRowProps): JSX.Element => {
  const { notepads, onEdit, onDelete, isLoading } = data
  const notepad = notepads[index]

  return (
    <div
      style={{
        ...style,
        height: `${(style.height as number) - 16}px`,
        top: `${(style.top as number) + index * 16}px`
      }}
    >
      <div className="p-2">
        <NotepadComponent
          key={notepad.id}
          notepad={notepad}
          onEdit={onEdit}
          onDelete={() => onDelete(notepad.id)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export function NotepadList({ workspaceId }: NotepadListProps): JSX.Element {
  const { notepads, isLoading, error, createNotepad, updateNotepad, deleteNotepad } =
    useNotepads(workspaceId)
  const [newNotepad, setNewNotepad] = useState({ name: '', text: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const [listHeight, setListHeight] = useState(0)

  useEffect(() => {
    const updateHeight = (): void => {
      if (listRef.current) {
        const rect = listRef.current.getBoundingClientRect()
        setListHeight(rect.height)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return (): void => window.removeEventListener('resize', updateHeight)
  }, [])

  const handleCreateNotepad = async (): Promise<void> => {
    try {
      await createNotepad({ name: newNotepad.name, text: newNotepad.text })
      setNewNotepad({ name: '', text: '' })
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleUpdateNotepad = async (notepad: {
    id: string
    name: string
    text: string
  }): Promise<void> => {
    try {
      await updateNotepad(notepad)
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

  const filteredNotepads = notepads.filter((notepad) => {
    const query = searchQuery.toLowerCase()
    return notepad.name.toLowerCase().includes(query) || notepad.text.toLowerCase().includes(query)
  })

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

      {/* Search Bar */}
      <div className="px-2 py-2 border-b border-input">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-accent/50">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notepads..."
            className="w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-hidden">
          {/* Create Form */}
          {newNotepad.name !== '' && (
            <div className="p-4">
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
                      value={newNotepad.name}
                      onChange={(e) => setNewNotepad({ ...newNotepad, name: e.target.value })}
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
                      value={newNotepad.text}
                      onChange={(e) => setNewNotepad({ ...newNotepad, text: e.target.value })}
                      className="block w-full mt-1 text-xs rounded-md border-input bg-background focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateNotepad}
                      disabled={isLoading}
                      className="px-3 py-1 text-xs font-medium border border-transparent rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setNewNotepad({ name: '', text: '' })}
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
            <div className="p-4">
              <div className="p-4 rounded-md text-destructive-foreground bg-destructive">
                {error}
              </div>
            </div>
          )}

          {/* Virtualized Notepads List */}
          {listHeight > 0 && (
            <List
              height={listHeight}
              itemCount={filteredNotepads.length}
              itemSize={266}
              width="100%"
              outerElementType={OuterElement}
              itemData={{
                notepads: filteredNotepads,
                onEdit: handleUpdateNotepad,
                onDelete: handleDeleteNotepad,
                isLoading
              }}
            >
              {NotepadRow}
            </List>
          )}
        </div>
      </div>
    </div>
  )
}
