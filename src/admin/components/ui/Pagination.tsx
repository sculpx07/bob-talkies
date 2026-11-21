import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Pagination as PaginationInfo } from '@/admin/types/api'
import { Button } from './Button'

/** "Showing 21-40 of 132" with previous / next. */
export function Pagination({ pagination, onPageChange }: { pagination?: PaginationInfo; onPageChange: (page: number) => void }) {
  if (!pagination || pagination.total === 0) return null
  const { page, limit, total, totalPages } = pagination
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <p>
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<ChevronLeft className="h-4 w-4" />} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="hidden sm:inline">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
