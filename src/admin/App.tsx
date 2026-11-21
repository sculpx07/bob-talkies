import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/api/queryClient'
import { AuthProvider } from './auth/AuthProvider'
import { LoadingBlock, ToastProvider } from './components/ui'
import { router } from './router'

/** Admin app root. Shares nothing with the customer site's providers. */
export function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingBlock className="min-h-screen" />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
