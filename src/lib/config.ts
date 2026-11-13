function requireEnv(key: string): string {
  const value = import.meta.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
  gtmId: import.meta.env.VITE_GTM_ID ?? '',
  razorpayKey: import.meta.env.VITE_RAZORPAY_KEY ?? '',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? '919876543210',
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://bobtalkies.com',
} as const
