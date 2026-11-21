import { CalendarClock, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import {
  Button, Card, CardHeader, ConfirmDialog, DataTable, EmptyState, IconButton, Menu, Switch, useToast, type Column, type MenuItem,
} from '@/admin/components/ui'
import { useDisclosure, useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { ROLES } from '@/admin/types/auth'
import { useDeleteSlot, useSetSlotActive, useSlots } from '../api'
import type { Slot, TheatreRef } from '../types'
import { endsNextDay, formatDays, formatDuration } from '../utils'
import { SlotFormModal } from './SlotFormModal'

/** The daily slots of one theatre. */
export function SlotsTab({ theatre }: { theatre: TheatreRef }) {
  const toast = useToast()
  const { hasRole } = useAuth()
  const slots = useSlots(theatre.id)
  const setActive = useSetSlotActive()
  const remove = useDeleteSlot()
  const add = useDisclosure()
  const edit = useDisclosureWith<Slot>()
  const confirmDelete = useDisclosureWith<Slot>()

  const toggle = (s: Slot) =>
    setActive.mutate(
      { id: s.id, isActive: !s.isActive },
      {
        onSuccess: (saved) => toast.success(`Slot ${formatTime(saved.startTime)} ${saved.isActive ? 'activated' : 'deactivated'}`),
        onError: (err) => toast.error('Could not change the slot', errorMessage(err)),
      },
    )

  const doDelete = () => {
    const s = confirmDelete.item
    if (!s) return
    remove.mutate(s.id, {
      onSuccess: () => { toast.success('Slot deleted'); confirmDelete.close() },
      onError: (err) => { confirmDelete.close(); toast.error('Could not delete the slot', errorMessage(err)) },
    })
  }

  const columns: Column<Slot>[] = [
    {
      key: 'time',
      header: 'Time',
      cell: (s) => (
        <div>
          <p className="font-medium text-slate-900">
            {formatTime(s.startTime)} – {formatTime(s.endTime)}
            {endsNextDay(s.startTime, s.endTime) && <span className="ml-1.5 text-xs font-normal text-slate-500">(next day)</span>}
          </p>
          {s.label && <p className="text-xs text-slate-500">{s.label}</p>}
        </div>
      ),
    },
    { key: 'duration', header: 'Length', cell: (s) => formatDuration(s.durationMinutes), hideOnMobile: true },
    { key: 'days', header: 'Runs on', cell: (s) => formatDays(s.daysOfWeek) },
    {
      key: 'price',
      header: 'Price',
      cell: (s) =>
        s.weekdayPricePaise === null && s.weekendPricePaise === null ? (
          <span className="text-slate-500">Theatre price</span>
        ) : (
          <div className="text-xs">
            <p>Weekday {s.weekdayPricePaise === null ? <span className="text-slate-500">theatre</span> : <span className="font-medium text-slate-900">{formatPaise(s.weekdayPricePaise)}</span>}</p>
            <p>Weekend {s.weekendPricePaise === null ? <span className="text-slate-500">theatre</span> : <span className="font-medium text-slate-900">{formatPaise(s.weekendPricePaise)}</span>}</p>
          </div>
        ),
    },
    {
      key: 'active',
      header: 'Active',
      cell: (s) => <Switch checked={s.isActive} onChange={() => toggle(s)} disabled={setActive.isPending && setActive.variables?.id === s.id} />,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (s) => {
        const items: MenuItem[] = [{ label: 'Edit', icon: <Pencil />, onSelect: () => edit.open(s) }]
        if (hasRole(ROLES.SUPER_ADMIN)) items.push({ label: 'Delete', icon: <Trash2 />, danger: true, onSelect: () => confirmDelete.open(s) })
        return <Menu trigger={<IconButton label={`Actions for ${s.startTime} slot`}><MoreHorizontal className="h-4 w-4" /></IconButton>} items={items} />
      },
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title={`${theatre.name} slots`}
        description="Repeat every day they run. Overlapping active slots are not allowed."
        actions={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Add slot</Button>}
      />
      <DataTable
        columns={columns}
        rows={slots.data}
        rowKey={(s) => s.id}
        loading={slots.isLoading}
        error={slots.error}
        onRetry={() => slots.refetch()}
        empty={<EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No slots yet" description="Add the time slots customers can book." action={<Button onClick={add.open}>Add slot</Button>} />}
      />

      <SlotFormModal open={add.isOpen} onOpenChange={add.setOpen} theatre={theatre} />
      <SlotFormModal open={edit.isOpen} onOpenChange={(o) => !o && edit.close()} theatre={theatre} slot={edit.item ?? undefined} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={(o) => !o && confirmDelete.close()}
        title="Delete this slot?"
        description="It disappears from the schedule. Slots with upcoming bookings cannot be deleted; deactivate them instead."
        confirmLabel="Delete slot"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doDelete}
      />
    </Card>
  )
}
