/** Admin app settings from Vite env (.env). */
export const env = {
  /** bob-admin backend, e.g. http://localhost:5000/api/v1 */
  apiUrl: (import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:5000/api/v1').replace(/\/+$/, ''),
  /** Customer site, linked from the top bar. */
  siteUrl: '/',
} as const
