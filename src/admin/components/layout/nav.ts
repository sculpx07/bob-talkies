import type { LucideIcon } from 'lucide-react'
import {
  BarChart3, CalendarClock, MessageSquareQuote, ReceiptIndianRupee, Package, CalendarDays, Clapperboard, Gift, LayoutDashboard, Settings, ShieldCheck, Sparkles, TicketPercent, Users, UserRound,
} from 'lucide-react'
import { PERMISSIONS as P, type Permission } from '@/admin/types/permissions'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** needed to see the item and open its page */
  permission: Permission
  /** hidden while leads are worked on in Sculpx CRM (Settings → CRM, sync on) */
  hideWhenCrmManaged?: boolean
  /** shown on the placeholder page until the module is built */
  description: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/** Sidebar navigation. Routes are generated from it too (src/admin/router.tsx). */
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: P.DASHBOARD_VIEW, description: "Today's bookings, open leads and follow-ups." },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Bookings', path: '/bookings', icon: CalendarDays, permission: P.BOOKINGS_VIEW, description: 'Day board, booking list, manual bookings, payments, reschedules and cancellations.' },
      { label: 'Leads', path: '/leads', icon: UserRound, permission: P.LEADS_VIEW, hideWhenCrmManaged: true, description: 'Enquiries from the website and phone, follow-ups and conversions.' },
      { label: 'Payments', path: '/payments', icon: ReceiptIndianRupee, permission: P.PAYMENTS_VIEW, description: 'Money received, refunds and what is waiting to be refunded.' },
      { label: 'Reports', path: '/reports', icon: BarChart3, permission: P.REPORTS_VIEW, description: 'Revenue, collections, occupancy, add-ons, offers and leads, with CSV export.' },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Theatres', path: '/theatres', icon: Clapperboard, permission: P.THEATRES_VIEW, description: 'Theatres, pricing, capacity and photos.' },
      { label: 'Slots & calendar', path: '/slots', icon: CalendarClock, permission: P.SLOTS_VIEW, description: 'Daily slots, blocked dates and special dates.' },
      { label: 'Add-ons & cakes', path: '/addons', icon: Gift, permission: P.ADDONS_VIEW, description: 'Cakes and their sizes, effects, decor, flowers, gifts, photography.' },
      { label: 'Offers', path: '/offers', icon: TicketPercent, permission: P.OFFERS_VIEW, description: 'Coupon codes, rules and a preview tool.' },
      { label: 'Packages', path: '/packages', icon: Package, permission: P.PACKAGES_VIEW, description: 'Celebration packages on the website.' },
      { label: 'Reviews', path: '/reviews', icon: MessageSquareQuote, permission: P.REVIEWS_VIEW, description: 'Customer testimonials on the website.' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings, permission: P.SETTINGS_VIEW, description: 'GST, advance payment, decoration price, slot hold and contact details.' },
      { label: 'Staff', path: '/staff', icon: Users, permission: P.STAFF_VIEW, description: 'Admin accounts.' },
      { label: 'Roles & permissions', path: '/roles', icon: ShieldCheck, permission: P.ROLES_VIEW, description: 'Roles and what each one can do.' },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

/** Brand mark used in the sidebar and on the login page. */
export const BRAND = { name: 'BOB Talkies', product: 'Admin', logo: '/logo.png', icon: Sparkles }
