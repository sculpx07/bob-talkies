import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDebouncedValue } from '@/admin/hooks/useDebouncedValue'
import { cn } from '@/admin/lib/utils/cn'
import { Input } from './Input'

/** Search box that reports its value after the user stops typing. */
export function SearchInput({ value, onChange, placeholder = 'Search…', className, delay = 350 }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  delay?: number
}) {
  const [text, setText] = useState(value)
  const debounced = useDebouncedValue(text, delay)

  useEffect(() => { setText(value) }, [value]) // external reset (e.g. "clear filters")
  useEffect(() => { if (debounced !== value) onChange(debounced) }, [debounced]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('w-full sm:w-72', className)}>
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        leading={<Search className="h-4 w-4" />}
        trailing={
          text ? (
            <button type="button" onClick={() => { setText(''); onChange('') }} className="focus-ring rounded text-slate-400 hover:text-slate-600" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        className="[&::-webkit-search-cancel-button]:hidden"
      />
    </div>
  )
}
