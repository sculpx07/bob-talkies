/** The backend stores money as integer paise (₹1 = 100 paise). */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const inrWhole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** 406746 -> "₹4,067.46"; whole rupees drop the decimals: 119900 -> "₹1,199" */
export function formatPaise(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return '—'
  return paise % 100 === 0 ? inrWhole.format(paise / 100) : inr.format(paise / 100)
}

/** "1199.50" -> 119950 (null when not a number) */
export function rupeesToPaise(rupees: string | number): number | null {
  const n = typeof rupees === 'number' ? rupees : Number(String(rupees).replace(/[,₹\s]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

/** 119950 -> "1199.5" (for editing in an input) */
export const paiseToRupees = (paise: number | null | undefined): string =>
  paise === null || paise === undefined ? '' : String(paise / 100)
