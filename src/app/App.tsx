import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { ConsentProvider } from './providers/ConsentProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { BookingProvider } from '@/features/booking/state/booking.context'

export function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <ToastProvider>
          <BookingProvider>
            <ConsentProvider>
              <RouterProvider router={router} />
            </ConsentProvider>
          </BookingProvider>
        </ToastProvider>
      </QueryProvider>
    </HelmetProvider>
  )
}
