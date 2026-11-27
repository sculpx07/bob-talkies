/**
 * Permission keys, same as the backend (bob-admin src/constants/permissions.js).
 * Pages, menu items and buttons are shown with `can(PERMISSIONS.X)`; the backend enforces the same keys.
 * The labelled list for the role editor comes from the API (GET /roles/permissions).
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_EDIT: 'bookings.edit',
  BOOKINGS_CANCEL: 'bookings.cancel',
  BOOKINGS_PAYMENTS: 'bookings.payments',
  BOOKINGS_REMOVE_PAYMENT: 'bookings.remove_payment',

  LEADS_VIEW: 'leads.view',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_DELETE: 'leads.delete',

  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_REFUND: 'payments.refund',

  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  THEATRES_VIEW: 'theatres.view',
  THEATRES_CREATE: 'theatres.create',
  THEATRES_EDIT: 'theatres.edit',
  THEATRES_DELETE: 'theatres.delete',

  SLOTS_VIEW: 'slots.view',
  SLOTS_EDIT: 'slots.edit',
  SLOTS_DELETE: 'slots.delete',

  ADDONS_VIEW: 'addons.view',
  ADDONS_CREATE: 'addons.create',
  ADDONS_EDIT: 'addons.edit',
  ADDONS_DELETE: 'addons.delete',

  OFFERS_VIEW: 'offers.view',
  OFFERS_CREATE: 'offers.create',
  OFFERS_EDIT: 'offers.edit',
  OFFERS_DELETE: 'offers.delete',

  PACKAGES_VIEW: 'packages.view',
  PACKAGES_CREATE: 'packages.create',
  PACKAGES_EDIT: 'packages.edit',
  PACKAGES_DELETE: 'packages.delete',

  REVIEWS_VIEW: 'reviews.view',
  REVIEWS_CREATE: 'reviews.create',
  REVIEWS_EDIT: 'reviews.edit',
  REVIEWS_DELETE: 'reviews.delete',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_PAYMENTS: 'settings.payments',
  SETTINGS_INTEGRATIONS: 'settings.integrations',

  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',

  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
