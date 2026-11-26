import { useState } from 'react'
import { CalendarX2, Plus, Trash2 } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Badge, Button, Card, CardHeader, ConfirmDialog, DataTable, EmptyState, IconButton, Pagination, Select, useToast, type Column } from '@/admin/components/ui'
import { useDisclosure, useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, formatTime, todayISO } from '@/admin/lib/utils/date'
import { useDeleteBlock, useSlotBlocks } from '../api'
import type { SlotBlock, TheatreRef } from '../types'
import { BlockFormModal } from './BlockFormModal'
import { Can } from '@/admin/auth/guards'
import { PERMISSIONS } from '@/admin/types/permissions'

const days = (b: SlotBlock) => differenceInCalendarDays(parseISO(b.endDate), parseISO(b.startDate)) + 1

/** Blocks affecting a theatre: its own and the all-theatre ones. */
export function BlocksTab({ theatre }: { theatre: TheatreRef }) {
  const toast = useToast()
  const [range, setRange] = useState<'upcoming' | 'all'>('upcoming')
  const [page, setPage] = useState(1)
  const blocks = useSlotBlocks({ theatre: theatre.id, startDate: range === 'upcoming' ? todayISO() : undefined, page })
  const remove = useDeleteBlock()
  const add = useDisclosure()
  const confirmDelete = useDisclosureWith<SlotBlock>()

  const doDelete = () => {
    if (!confirmDelete.item) return
    remove.mutate(confirmDelete.item.id, {
      onSuccess: () => { toast.success('Block removed: those dates can be booked again'); confirmDelete.close() },
      onError: (err) => toast.error('Could not remove the block', errorMessage(err)),
    })
  }

  const columns: Column<SlotBlock>[] = [
    {
      key: 'dates',
      header: 'Dates',
      cell: (b) => (
        <div>
          <p className="font-medium text-slate-900">{formatDate(b.startDate)}{b.endDate !== b.startDate && <> – {formatDate(b.endDate)}</>}</p>
          {days(b) > 1 && <p className="text-xs text-slate-500">{days(b)} days</p>}
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Applies to',
      cell: (b) =>
        !b.theatre ? <Badge tone="warning">All theatres</Badge>
          : b.slot ? <span>{b.theatre.name} · {formatTime(b.slot.startTime)} slot</span>
          : <span>{b.theatre.name} · whole day</span>,
    },
    { key: 'reason', header: 'Reason', cell: (b) => b.reason },
    { key: 'by', header: 'Added by', hideOnMobile: true, cell: (b) => <span className="text-slate-500">{b.createdBy?.name ?? '—'}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (b) => (
        <IconButton label="Remove block" onClick={() => confirmDelete.open(b)}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Blocked dates"
        description={`Blocks for ${theatre.name}, plus those for all theatres.`}
        actions={
          <>
            <div className="w-36">
              <Select aria-label="Which blocks" value={range} onChange={(e) => { setRange(e.target.value as 'upcoming' | 'all'); setPage(1) }} options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'all', label: 'All, incl. past' }]} />
            </div>
            <Can permission={PERMISSIONS.SLOTS_EDIT}><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Block dates</Button></Can>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={blocks.data?.blocks}
        rowKey={(b) => b.id}
        loading={blocks.isLoading}
        error={blocks.error}
        onRetry={() => blocks.refetch()}
        empty={<EmptyState icon={<CalendarX2 className="h-5 w-5" />} title={range === 'upcoming' ? 'No upcoming blocks' : 'No blocks'} description="Every slot can be booked." />}
      />
      <Pagination pagination={blocks.data?.pagination} onPageChange={setPage} />

      <BlockFormModal open={add.isOpen} onOpenChange={add.setOpen} theatre={theatre} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={(o) => !o && confirmDelete.close()}
        title="Remove this block?"
        description="Those dates become bookable again."
        confirmLabel="Remove block"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doDelete}
      />
    </Card>
  )
}
