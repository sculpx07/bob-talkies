import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { EmptyState, LoadingBlock, Tabs } from '@/admin/components/ui'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { todayISO } from '@/admin/lib/utils/date'
import { BlocksTab } from '../components/BlocksTab'
import { DayPreviewTab } from '../components/DayPreviewTab'
import { SlotsTab } from '../components/SlotsTab'
import { SpecialDatesTab } from '../components/SpecialDatesTab'

/** One page for everything that shapes a theatre's bookable calendar. Theatre, tab and date live in the URL. */
export default function SlotsPage() {
  const [params, setParams] = useSearchParams()
  const theatres = useTheatreOptions()
  const tab = params.get('tab') ?? 'slots'
  const date = params.get('date') ?? todayISO()
  const theatreId = params.get('theatre') ?? ''

  const set = (changes: Record<string, string>) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
      return next
    }, { replace: true })

  // default to the first theatre
  useEffect(() => {
    if (!theatreId && theatres.data?.length) set({ theatre: theatres.data[0].id })
  }, [theatreId, theatres.data]) // eslint-disable-line react-hooks/exhaustive-deps

  const theatre = theatres.data?.find((t) => t.id === theatreId)

  return (
    <>
      <PageHeader
        title="Slots & calendar"
        description="Daily slots, blocked dates and special dates for each theatre."
        actions={<div className="w-56"><TheatreSelect value={theatreId} onChange={(id) => set({ theatre: id })} /></div>}
      />

      {theatres.isLoading ? (
        <LoadingBlock />
      ) : !theatres.data?.length ? (
        <EmptyState icon={<Clapperboard className="h-5 w-5" />} title="Add a theatre first" description="Slots belong to a theatre." />
      ) : !theatre ? (
        <LoadingBlock />
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => set({ tab: value === 'slots' ? '' : value })}
          items={[
            { value: 'slots', label: 'Daily slots', content: <SlotsTab theatre={theatre} /> },
            { value: 'preview', label: 'Day preview', content: <DayPreviewTab theatre={theatre} date={date} onDateChange={(d) => set({ date: d })} /> },
            { value: 'blocks', label: 'Blocked dates', content: <BlocksTab theatre={theatre} /> },
            { value: 'special', label: 'Special dates', content: <SpecialDatesTab theatre={theatre} /> },
          ]}
        />
      )}
    </>
  )
}
