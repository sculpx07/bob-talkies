import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './errors'

/** Client errors (4xx) will not fix themselves, so only network / server errors are retried. */
const shouldRetry = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: true, // admins keep tabs open; show fresh bookings when they come back
    },
    mutations: { retry: false },
  },
})
