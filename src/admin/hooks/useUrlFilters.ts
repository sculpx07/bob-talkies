import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

type FilterValue = string | number | boolean | undefined
type Filters = Record<string, FilterValue>

/**
 * List filters kept in the URL (?page=2&status=new), so a filtered list can be
 * refreshed, bookmarked or shared. Values equal to their default are left out.
 *
 *   const [filters, setFilters] = useUrlFilters({ page: 1, search: '', status: '' })
 *   setFilters({ status: 'new' })   // also resets page to 1
 */
export function useUrlFilters<T extends Filters>(defaults: T) {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const raw = params.get(key as string)
      if (raw === null) continue
      const fallback = defaults[key]
      result[key] = (typeof fallback === 'number' ? Number(raw) || fallback
        : typeof fallback === 'boolean' ? raw === 'true'
        : raw) as T[keyof T]
    }
    return result
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const setFilters = useCallback((changes: Partial<T>) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      const merged: Filters = { ...filters, ...changes }
      // any change other than the page itself goes back to page 1
      if ('page' in defaults && !('page' in changes)) merged.page = defaults.page
      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === '' || value === defaults[key]) next.delete(key)
        else next.set(key, String(value))
      }
      return next
    }, { replace: true })
  }, [filters, setParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // clears only this hook's keys, so other URL state (e.g. the open tab) stays
  const reset = useCallback(() => setParams((current) => {
    const next = new URLSearchParams(current)
    Object.keys(defaults).forEach((key) => next.delete(key))
    return next
  }, { replace: true }), [setParams]) // eslint-disable-line react-hooks/exhaustive-deps

  return [filters, setFilters, reset] as const
}
