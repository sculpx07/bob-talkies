import { lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { RequireAuth, RequirePermission } from './auth/guards'
import { AdminLayout } from './components/layout/AdminLayout'
import { NAV_ITEMS } from './components/layout/nav'
import { PERMISSIONS, type Permission } from './types/permissions'
import { NotFoundPage, RouteErrorPage } from './features/placeholder/ErrorPages'
import { HideWhenCrmManaged } from './features/leads/components/HideWhenCrmManaged'

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
const PaymentsPage = lazy(() => import('./features/payments/pages/PaymentsPage'))
const StaffPage = lazy(() => import('./features/users/pages/StaffPage'))
const AccountPage = lazy(() => import('./features/account/pages/AccountPage'))
const RolesPage = lazy(() => import('./features/roles/pages/RolesPage'))
const RoleEditorPage = lazy(() => import('./features/roles/pages/RoleEditorPage'))

const P = PERMISSIONS
/** Page that needs at least one of the permissions; others see "no access". */
const guard = (anyOf: Permission[], element: ReactNode) => <RequirePermission anyOf={anyOf}>{element}</RequirePermission>

/** "/": the dashboard, or the first page this person may open when their role has no dashboard. */
function HomeRoute() {
  const { can } = useAuth()
  if (can(P.DASHBOARD_VIEW)) return <DashboardPage />
  const first = NAV_ITEMS.find((item) => item.path !== '/' && can(item.permission))
  return first ? <Navigate to={first.path} replace /> : guard([P.DASHBOARD_VIEW], null)
}

/**
 * Pages that are built. Every other sidebar item shows a placeholder until its
 * module lands; add the module's routes here (and its path to builtPaths) as it is built.
 */
const builtRoutes: RouteObject[] = [
  { index: true, element: <HomeRoute /> },
  {
    path: 'theatres',
    children: [
      { index: true, element: guard([P.THEATRES_VIEW], <TheatresListPage />) },
      { path: 'new', element: guard([P.THEATRES_CREATE], <TheatreCreatePage />) },
      { path: ':id', element: guard([P.THEATRES_VIEW], <TheatreEditPage />) },
    ],
  },
  { path: 'slots', element: guard([P.SLOTS_VIEW], <SlotsPage />) },
  {
    path: 'addons',
    children: [
      { index: true, element: guard([P.ADDONS_VIEW], <AddonsPage />) },
      { path: 'new', element: guard([P.ADDONS_CREATE], <AddonCreatePage />) },
      { path: ':id', element: guard([P.ADDONS_VIEW], <AddonEditPage />) },
    ],
  },
  {
    path: 'offers',
    children: [
      { index: true, element: guard([P.OFFERS_VIEW], <OffersListPage />) },
      { path: 'new', element: guard([P.OFFERS_CREATE], <OfferCreatePage />) },
      { path: ':id', element: guard([P.OFFERS_VIEW], <OfferEditPage />) },
    ],
  },
  { path: 'settings', element: guard([P.SETTINGS_VIEW], <SettingsPage />) },
  {
    path: 'bookings',
    children: [
      { index: true, element: guard([P.BOOKINGS_VIEW], <BookingsPage />) },
      { path: 'new', element: guard([P.BOOKINGS_CREATE], <NewBookingPage />) },
      { path: ':id', element: guard([P.BOOKINGS_VIEW], <BookingDetailPage />) },
    ],
  },
  {
    path: 'leads',
    children: [
      { index: true, element: guard([P.LEADS_VIEW], <HideWhenCrmManaged><LeadsPage /></HideWhenCrmManaged>) },
      { path: ':id', element: guard([P.LEADS_VIEW], <HideWhenCrmManaged><LeadDetailPage /></HideWhenCrmManaged>) },
    ],
  },
  { path: 'payments', element: guard([P.PAYMENTS_VIEW], <PaymentsPage />) },
  { path: 'reports', element: guard([P.REPORTS_VIEW], <ReportsPage />) },
  { path: 'packages', element: guard([P.PACKAGES_VIEW], <PackagesPage />) },
  { path: 'reviews', element: guard([P.REVIEWS_VIEW], <ReviewsPage />) },
  { path: 'staff', element: guard([P.STAFF_VIEW], <StaffPage />) },
  {
    path: 'roles',
    children: [
      { index: true, element: guard([P.ROLES_VIEW], <RolesPage />) },
      { path: 'new', element: guard([P.ROLES_MANAGE], <RoleEditorPage />) },
      { path: ':id', element: guard([P.ROLES_VIEW], <RoleEditorPage />) },
    ],
  },
  // every signed-in staff member; reached from the user menu, not the sidebar
  { path: 'account', element: <AccountPage /> },
]

const builtPaths = new Set(['/', '/theatres', '/slots', '/addons', '/offers', '/settings', '/bookings', '/leads', '/payments', '/reports', '/packages', '/reviews', '/staff', '/roles'])

const placeholderRoutes: RouteObject[] = NAV_ITEMS.filter((item) => !builtPaths.has(item.path)).map((item) => ({
  path: `${item.path.slice(1)}/*`,
  element: guard([item.permission], <PlaceholderPage item={item} />),
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
