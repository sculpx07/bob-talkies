import { Select } from '@/admin/components/ui'
import { useTheatreOptions } from '../api'

/** Dropdown of theatres (inactive ones marked), for any module that works per theatre. */
export function TheatreSelect({ value, onChange, allLabel, id, invalid, className }: {
  value: string
  onChange: (theatreId: string) => void
  /** adds an "all theatres" option with value '' */
  allLabel?: string
  id?: string
  invalid?: boolean
  className?: string
}) {
  const theatres = useTheatreOptions()
  return (
    <Select
      id={id}
      aria-label="Theatre"
      invalid={invalid}
      className={className}
      value={value}
      disabled={theatres.isLoading}
      onChange={(e) => onChange(e.target.value)}
      placeholder={allLabel}
      options={(theatres.data ?? []).map((t) => ({ value: t.id, label: t.isActive ? t.name : `${t.name} (inactive)` }))}
    />
  )
}
