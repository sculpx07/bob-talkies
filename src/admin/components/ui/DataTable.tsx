import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'
import { EmptyState, ErrorState, Skeleton } from './States'

export interface Column<T> {
  /** unique key; also the sort field when `sortable` */
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  /** e.g. "w-32" or "min-w-[12rem]" */
  className?: string
  /** hide below the md breakpoint */
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  /** current sort, e.g. "name" or "-createdAt" */
  sort?: string
  onSortChange?: (sort: string) => void
  onRowClick?: (row: T) => void
  empty?: ReactNode
  skeletonRows?: number
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' }

/** Table with header sorting, row click, loading skeleton, empty and error states. */
export function DataTable<T>({
  columns, rows, rowKey, loading, error, onRetry, sort, onSortChange, onRowClick, empty, skeletonRows = 5,
}: DataTableProps<T>) {
  const sortField = sort?.replace(/^-/, '')
  const sortDesc = sort?.startsWith('-')

  const toggleSort = (key: string) => {
    if (!onSortChange) return
    onSortChange(sortField === key && !sortDesc ? `-${key}` : key)
  }

  if (error) return <ErrorState error={error} retry={onRetry} />

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => {
              const active = sortField === col.key
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sortDesc ? 'descending' : 'ascending') : undefined}
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500',
                    alignClass[col.align ?? 'left'],
                    col.hideOnMobile && 'hidden md:table-cell',
                    col.className,
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button type="button" onClick={() => toggleSort(col.key)} className="focus-ring inline-flex items-center gap-1 rounded hover:text-slate-800">
                      {col.header}
                      {active ? (sortDesc ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />) : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {loading && !rows?.length
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.hideOnMobile && 'hidden md:table-cell')}>
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))
            : rows?.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-slate-50', loading && 'opacity-60')}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-slate-700', alignClass[col.align ?? 'left'], col.hideOnMobile && 'hidden md:table-cell', col.className)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && rows?.length === 0 && (empty ?? <EmptyState title="Nothing here yet" />)}
    </div>
  )
}
