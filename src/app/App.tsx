import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { ConsentProvider } from './providers/ConsentProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { BookingProvider } from '@/features/booking/state/booking.context'
import { SplashScreen } from '@/components/layout/SplashScreen'

export function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <HelmetProvider>
      <QueryProvider>
        <ToastProvider>
          <BookingProvider>
            <ConsentProvider>
              {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
              <RouterProvider router={router} />
            </ConsentProvider>
          </BookingProvider>
        </ToastProvider>
      </QueryProvider>
    </HelmetProvider>
  )
}
