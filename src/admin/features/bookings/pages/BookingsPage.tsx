import { Link, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Button, Tabs } from '@/admin/components/ui'
import { todayISO } from '@/admin/lib/utils/date'
import { BookingsTable } from '../components/BookingsTable'
import { DayBoardView } from '../components/DayBoardView'

/** Bookings: the day board (default) and the full list. Tab and board date live in the URL. */
export default function BookingsPage() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') ?? 'board'
  const date = params.get('date') ?? todayISO()

  // switching tabs drops the other tab's filters
  const setView = (v: string) => setParams(v === 'board' ? {} : { view: v }, { replace: true })
  const setDate = (d: string) => setParams(d === todayISO() ? {} : { date: d }, { replace: true })

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Today's board, every booking, and what is due. Click an open slot on the board to book it."
        actions={<Link to={`/bookings/new${view === 'board' ? `?date=${date}` : ''}`}><Button leftIcon={<Plus className="h-4 w-4" />}>New booking</Button></Link>}
      />
      <Tabs
        value={view}
        onValueChange={setView}
        items={[
          { value: 'board', label: 'Day board', content: <DayBoardView date={date} onDateChange={setDate} /> },
          { value: 'list', label: 'All bookings', content: <BookingsTable /> },
        ]}
      />
    </>
  )
}
