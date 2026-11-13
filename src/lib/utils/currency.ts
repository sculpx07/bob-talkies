/** Format integer paise to INR display string */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

/** Format integer paise to compact display (e.g. ₹1.2K) */
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`
  }
  return formatINR(paise)
}

/** Convert rupees to paise */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/** Convert paise to rupees */
export function paiseToRupees(paise: number): number {
  return paise / 100
}
