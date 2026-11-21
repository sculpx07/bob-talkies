import { useState } from 'react'
import { History } from 'lucide-react'
import { Card, CardHeader, DataTable, EmptyState, Pagination, type Column } from '@/admin/components/ui'
import { formatDateTime, timeAgo } from '@/admin/lib/utils/date'
import { useSettingHistory } from '../api'
import { formatSettingValue, settingLabel } from '../labels'
import type { SettingHistoryEntry } from '../types'

const columns: Column<SettingHistoryEntry>[] = [
  {
    key: 'when',
    header: 'When',
    className: 'w-48',
    cell: (h) => (
      <div>
        <p className="text-slate-900">{timeAgo(h.createdAt)}</p>
        <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
      </div>
    ),
  },
  { key: 'who', header: 'By', className: 'w-40', cell: (h) => h.changedBy?.name ?? '—' },
  {
    key: 'changes',
    header: 'Changes',
    cell: (h) => (
      <ul className="space-y-1">
        {h.changes.map((c) => (
          <li key={c.path} className="text-sm">
            <span className="text-slate-600">{settingLabel(c.path)}:</span>{' '}
            <span className="text-slate-400 line-through">{formatSettingValue(c.path, c.from)}</span>{' '}
            → <span className="font-medium text-slate-900">{formatSettingValue(c.path, c.to)}</span>
          </li>
        ))}
      </ul>
    ),
  },
]

/** Every saved settings change, newest first. */
export function HistoryTab() {
  const [page, setPage] = useState(1)
  const history = useSettingHistory(page)
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Change history" description="Who changed which setting, from what to what." />
      <DataTable
        columns={columns}
        rows={history.data?.history}
        rowKey={(h) => h.id}
        loading={history.isLoading}
        error={history.error}
        onRetry={() => history.refetch()}
        empty={<EmptyState icon={<History className="h-5 w-5" />} title="No changes yet" description="Saved changes appear here." />}
      />
      <Pagination pagination={history.data?.pagination} onPageChange={setPage} />
    </Card>
  )
}
