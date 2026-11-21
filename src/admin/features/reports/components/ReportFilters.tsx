import { Input, Select } from '@/admin/components/ui'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { RANGE_PRESETS, presetRange, type RangePreset } from '../utils'

export interface ReportFilterValues {
  preset: string
  from: string
  to: string
  theatre: string
}

/** Period preset, custom dates and theatre, all in one row above the charts. */
export function ReportFilters({ value, onChange }: { value: ReportFilterValues; onChange: (changes: Partial<ReportFilterValues>) => void }) {
  const pickPreset = (preset: RangePreset) =>
    onChange(preset === 'custom' ? { preset } : { preset, ...presetRange(preset) })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-44">
        <Select aria-label="Period" value={value.preset} onChange={(e) => pickPreset(e.target.value as RangePreset)} options={RANGE_PRESETS} />
      </div>
      <Input
        aria-label="From"
        type="date"
        className="w-40"
        value={value.from}
        max={value.to}
        onChange={(e) => e.target.value && onChange({ preset: 'custom', from: e.target.value })}
      />
      <span className="pb-2 text-sm text-slate-400">to</span>
      <Input
        aria-label="To"
        type="date"
        className="w-40"
        value={value.to}
        min={value.from}
        onChange={(e) => e.target.value && onChange({ preset: 'custom', to: e.target.value })}
      />
      <div className="w-48">
        <TheatreSelect value={value.theatre} onChange={(theatre) => onChange({ theatre })} allLabel="All theatres" />
      </div>
    </div>
  )
}
