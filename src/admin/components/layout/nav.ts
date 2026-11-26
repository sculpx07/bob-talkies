import type { LucideIcon } from 'lucide-react'
import {
  BarChart3, CalendarClock, MessageSquareQuote, Package, CalendarDays, Clapperboard, Gift, LayoutDashboard, Settings, Sparkles, TicketPercent, Users, UserRound,
} from 'lucide-react'
import { ROLES, type RoleName } from '@/admin/types/auth'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** limit to these roles; omitted = every staff member */
  roles?: RoleName[]
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
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, description: "Today's bookings, open leads and follow-ups." },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Bookings', path: '/bookings', icon: CalendarDays, description: 'Day board, booking list, manual bookings, payments, reschedules and cancellations.' },
      { label: 'Leads', path: '/leads', icon: UserRound, description: 'Enquiries from the website and phone, follow-ups and conversions.' },
      { label: 'Reports', path: '/reports', icon: BarChart3, description: 'Revenue, collections, occupancy, add-ons, offers and leads, with CSV export.' },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Theatres', path: '/theatres', icon: Clapperboard, description: 'Theatres, pricing, capacity and photos.' },
      { label: 'Slots & calendar', path: '/slots', icon: CalendarClock, description: 'Daily slots, blocked dates and special dates.' },
      { label: 'Add-ons & cakes', path: '/addons', icon: Gift, description: 'Cakes and their sizes, effects, decor, flowers, gifts, photography.' },
      { label: 'Offers', path: '/offers', icon: TicketPercent, description: 'Coupon codes, rules and a preview tool.' },
      { label: 'Packages', path: '/packages', icon: Package, description: 'Celebration packages on the website.' },
      { label: 'Reviews', path: '/reviews', icon: MessageSquareQuote, description: 'Customer testimonials on the website.' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings, description: 'GST, advance payment, decoration price, slot hold and contact details.' },
      { label: 'Staff', path: '/staff', icon: Users, roles: [ROLES.SUPER_ADMIN], description: 'Admin accounts and roles.' },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items)

/** Brand mark used in the sidebar and on the login page. */
export const BRAND = { name: 'BOB Talkies', product: 'Admin', logo: '/logo.png', icon: Sparkles }
