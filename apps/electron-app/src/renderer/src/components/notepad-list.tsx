import { useState, useRef, useEffect, forwardRef } from 'react'
import { useNotepads } from '../hooks/use-notepads'
import { Search, Plus } from 'lucide-react'
import { Notepad as NotepadComponent } from './notepad'
import { CreateNotepad } from './create-notepad'
import { VariableSizeList as List } from 'react-window'
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
    setSize: (index: number, size: number) => void
  }
}

// Custom outer element for List with scrollbar styles
const OuterElement = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className="flex flex-col gap-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
  />
))
OuterElement.displayName = 'OuterElement'

const NotepadRow = ({ index, style, data }: NotepadRowProps): JSX.Element => {
  const { notepads, onEdit, onDelete, isLoading, setSize } = data
  const notepad = notepads[index]
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rowRef.current) {
      setSize(index, rowRef.current.getBoundingClientRect().height)
    }
  }, [setSize, index, notepad.text, notepad.name])

  return (
    <div style={style}>
      <div ref={rowRef} className="p-2">
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
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const [listHeight, setListHeight] = useState(0)
  const sizeMap = useRef<{ [key: number]: number }>({})
  const listInstance = useRef<List>(null)

  const getItemSize = (index: number): number => {
    return sizeMap.current[index] || 100 // Default height
  }

  const setItemSize = (index: number, size: number): void => {
    sizeMap.current[index] = size
    if (listInstance.current) {
      listInstance.current.resetAfterIndex(index)
    }
  }

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
          onClick={() => setIsCreateFormOpen(true)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Create Form */}
      <CreateNotepad
        onCreateNotepad={createNotepad}
        isLoading={isLoading}
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
      />

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
              ref={listInstance}
              height={listHeight}
              itemCount={filteredNotepads.length}
              itemSize={getItemSize}
              width="100%"
              outerElementType={OuterElement}
              itemData={{
                notepads: filteredNotepads,
                onEdit: handleUpdateNotepad,
                onDelete: handleDeleteNotepad,
                isLoading,
                setSize: setItemSize
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
