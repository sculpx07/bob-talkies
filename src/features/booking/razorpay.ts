/*
 * Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).
 * The script is loaded only when a customer pays, so it never slows down other pages.
 */

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/** What Razorpay hands to the success handler; the backend verifies the signature. */
export interface RazorpaySuccess {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayOptions {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  handler: (response: RazorpaySuccess) => void
  modal?: { ondismiss?: () => void; confirm_close?: boolean }
}

interface RazorpayInstance {
  open: () => void
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance

let loading: Promise<RazorpayConstructor> | null = null

/** Loads checkout.js once and returns the Razorpay constructor. */
export function loadRazorpayCheckout(): Promise<RazorpayConstructor> {
  const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
  if (existing) return Promise.resolve(existing)

  loading ??= new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.async = true
    script.onload = () => {
      const ctor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
      if (ctor) resolve(ctor)
      else reject(new Error('The payment window could not start. Please try again.'))
    }
    script.onerror = () => {
      script.remove()
      loading = null // allow another try
      reject(new Error('Could not open the payment window. Check your internet connection and try again.'))
    }
    document.head.appendChild(script)
  })
  return loading
}
