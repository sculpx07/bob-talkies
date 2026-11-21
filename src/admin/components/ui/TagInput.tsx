import { useId, useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  /** offered as quick picks and in the browser's autocomplete */
  suggestions?: string[]
  /** shows a friendlier label for a stored value (e.g. slug -> "Date night") */
  formatTag?: (tag: string) => string
  /** turns typed text into the stored value (e.g. "Date Night" -> "date-night") */
  normalize?: (text: string) => string
  placeholder?: string
  max?: number
  id?: string
  invalid?: boolean
  describedBy?: string
}

/** List of short values (facilities, occasions). Enter or comma adds; Backspace removes the last. */
export function TagInput({
  value, onChange, suggestions = [], formatTag = (t) => t, normalize = (t) => t.trim(),
  placeholder = 'Type and press Enter', max = 50, id, invalid, describedBy,
}: TagInputProps) {
  const [text, setText] = useState('')
  const listId = useId()

  const add = (raw: string) => {
    const tag = normalize(raw)
    if (!tag || value.includes(tag) || value.length >= max) return
    onChange([...value, tag])
  }
  const remove = (tag: string) => onChange(value.filter((t) => t !== tag))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && text.trim()) {
      e.preventDefault()
      add(text)
      setText('')
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1])
    }
  }

  const unused = suggestions.filter((s) => !value.includes(normalize(s)))

  return (
    <div className="space-y-2">
      <div className={cn('field flex min-h-9 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20', invalid && 'field-invalid')}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 py-0.5 pl-2 pr-1 text-xs font-medium text-slate-700">
            {formatTag(tag)}
            <button type="button" onClick={() => remove(tag)} className="focus-ring rounded text-slate-400 hover:text-slate-700" aria-label={`Remove ${formatTag(tag)}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          list={suggestions.length ? listId : undefined}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (text.trim()) { add(text); setText('') } }}
          placeholder={value.length ? '' : placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
        />
      </div>
      {suggestions.length > 0 && (
        <>
          <datalist id={listId}>{unused.map((s) => <option key={s} value={s} />)}</datalist>
          {unused.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {unused.slice(0, 12).map((s) => (
                <button key={s} type="button" onClick={() => add(s)} className="focus-ring rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-500 hover:border-violet-400 hover:text-violet-700">
                  + {formatTag(normalize(s))}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
