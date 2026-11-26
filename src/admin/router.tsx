import { lazy } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RequireAuth, RequireRole } from './auth/guards'
import { AdminLayout } from './components/layout/AdminLayout'
import { NAV_ITEMS } from './components/layout/nav'
import { ROLES } from './types/auth'
import { NotFoundPage, RouteErrorPage } from './features/placeholder/ErrorPages'

// Pages load on demand, so the first screen stays small.
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const PlaceholderPage = lazy(() => import('./features/placeholder/PlaceholderPage'))
const TheatresListPage = lazy(() => import('./features/theatres/pages/TheatresListPage'))
const TheatreCreatePage = lazy(() => import('./features/theatres/pages/TheatreCreatePage'))
const TheatreEditPage = lazy(() => import('./features/theatres/pages/TheatreEditPage'))
const SlotsPage = lazy(() => import('./features/slots/pages/SlotsPage'))
const AddonsPage = lazy(() => import('./features/addons/pages/AddonsPage'))
const AddonCreatePage = lazy(() => import('./features/addons/pages/AddonCreatePage'))
const AddonEditPage = lazy(() => import('./features/addons/pages/AddonEditPage'))
const OffersListPage = lazy(() => import('./features/offers/pages/OffersListPage'))
const OfferCreatePage = lazy(() => import('./features/offers/pages/OfferCreatePage'))
const OfferEditPage = lazy(() => import('./features/offers/pages/OfferEditPage'))
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'))
const BookingsPage = lazy(() => import('./features/bookings/pages/BookingsPage'))
const BookingDetailPage = lazy(() => import('./features/bookings/pages/BookingDetailPage'))
const NewBookingPage = lazy(() => import('./features/bookings/pages/NewBookingPage'))
const LeadsPage = lazy(() => import('./features/leads/pages/LeadsPage'))
const LeadDetailPage = lazy(() => import('./features/leads/pages/LeadDetailPage'))
const PackagesPage = lazy(() => import('./features/packages/pages/PackagesPage'))
const ReviewsPage = lazy(() => import('./features/reviews/pages/ReviewsPage'))
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage'))
const StaffPage = lazy(() => import('./features/users/pages/StaffPage'))
const AccountPage = lazy(() => import('./features/account/pages/AccountPage'))

/**
 * Pages that are built. Every other sidebar item shows a placeholder until its
 * module lands; add the module's routes here (and its path to builtPaths) as it is built.
 */
const builtRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
  {
    path: 'theatres',
    children: [
      { index: true, element: <TheatresListPage /> },
      { path: 'new', element: <TheatreCreatePage /> },
      { path: ':id', element: <TheatreEditPage /> },
    ],
  },
  { path: 'slots', element: <SlotsPage /> },
  {
    path: 'addons',
    children: [
      { index: true, element: <AddonsPage /> },
      { path: 'new', element: <AddonCreatePage /> },
      { path: ':id', element: <AddonEditPage /> },
    ],
  },
  {
    path: 'offers',
    children: [
      { index: true, element: <OffersListPage /> },
      { path: 'new', element: <OfferCreatePage /> },
      { path: ':id', element: <OfferEditPage /> },
    ],
  },
  { path: 'settings', element: <SettingsPage /> },
  {
    path: 'bookings',
    children: [
      { index: true, element: <BookingsPage /> },
      { path: 'new', element: <NewBookingPage /> },
      { path: ':id', element: <BookingDetailPage /> },
    ],
  },
  {
    path: 'leads',
    children: [
      { index: true, element: <LeadsPage /> },
      { path: ':id', element: <LeadDetailPage /> },
    ],
  },
  { path: 'reports', element: <ReportsPage /> },
  { path: 'packages', element: <PackagesPage /> },
  { path: 'reviews', element: <ReviewsPage /> },
  {
    path: 'staff',
    element: (
      <RequireRole roles={[ROLES.SUPER_ADMIN]}>
        <StaffPage />
      </RequireRole>
    ),
  },
  // every signed-in staff member; reached from the user menu, not the sidebar
  { path: 'account', element: <AccountPage /> },
]

const builtPaths = new Set(['/', '/theatres', '/slots', '/addons', '/offers', '/settings', '/bookings', '/leads', '/reports', '/packages', '/reviews', '/staff'])

const placeholderRoutes: RouteObject[] = NAV_ITEMS.filter((item) => !builtPaths.has(item.path)).map((item) => ({
  path: `${item.path.slice(1)}/*`,
  element: item.roles ? (
    <RequireRole roles={item.roles}>
      <PlaceholderPage item={item} />
    </RequireRole>
  ) : (
    <PlaceholderPage item={item} />
  ),
}))

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage />, errorElement: <RouteErrorPage /> },
    {
      element: <RequireAuth />,
      errorElement: <RouteErrorPage />,
      children: [
        {
          element: <AdminLayout />,
          children: [...builtRoutes, ...placeholderRoutes, { path: '*', element: <NotFoundPage /> }],
        },
      ],
    },
  ],
  { basename: '/admin' },
)
