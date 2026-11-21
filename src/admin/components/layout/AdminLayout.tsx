import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Drawer, LoadingBlock } from '@/admin/components/ui'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Shell for signed-in pages: sidebar (drawer on mobile), top bar and the page. */
export function AdminLayout() {
  const nav = useDisclosure()
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 lg:block">
        <Sidebar />
      </aside>

      <Drawer open={nav.isOpen} onOpenChange={nav.setOpen} title="Menu" side="left" className="w-64">
        <Sidebar onNavigate={nav.close} />
      </Drawer>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onOpenNav={nav.open} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<LoadingBlock />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
