import ReactMarkdown from 'react-markdown'
import type { Notepad as NotepadType, NotepadContext } from '../stores/notepad-store'
import { Pencil, Trash, ChevronDown, ChevronUp, X, Check } from 'lucide-react'
import { useState } from 'react'

interface NotepadProps {
  notepad: NotepadType
  onEdit: (notepad: { id: string; name: string; text: string }) => void
  onDelete: () => void
  isLoading?: boolean
}

export function Notepad({ notepad, onEdit, onDelete, isLoading }: NotepadProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(notepad.name)
  const [editedText, setEditedText] = useState(notepad.text)

  const handleSave = async (): Promise<void> => {
    // Create a sanitized copy of the notepad data
    const sanitizedNotepad: NotepadType = {
      id: notepad.id,
      name: editedName,
      text: editedText,
      createdAt: notepad.createdAt,
      workspaceId: notepad.workspaceId,
      context: notepad.context
        ? {
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
        : undefined
    }

    await onEdit(sanitizedNotepad)
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setEditedName(notepad.name)
    setEditedText(notepad.text)
    setIsEditing(false)
  }

  return (
    <div className="p-4 space-y-4 transition-colors border rounded-lg bg-card border-input hover:border-primary/50">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-card-foreground min-w-[200px]"
            autoFocus
          />
        ) : (
          <h4 className="text-lg font-medium text-card-foreground">{notepad.name}</h4>
        )}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                disabled={isLoading}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div
        className={`prose-sm prose prose-invert max-w-none overflow-y-auto ${isExpanded ? 'max-h-none' : 'max-h-[200px]'} [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30`}
      >
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-full min-h-[200px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-mono text-sm"
          />
        ) : (
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="mb-4 text-xl font-bold">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-3 text-lg font-bold">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-2 text-base font-bold">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="pl-4 mb-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="pl-4 mb-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="p-4 overflow-x-auto rounded bg-muted text-muted-foreground">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="pl-4 italic border-l-2 border-primary/50">
                  {children}
                </blockquote>
              )
            }}
          >
            {notepad.text}
          </ReactMarkdown>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-input">
        <p className="text-xs text-muted-foreground">
          Created: {new Date(notepad.createdAt).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Last modified: {new Date(notepad.updatedAt || notepad.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
