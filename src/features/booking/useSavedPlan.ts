import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from './state/booking.context'

export const SAVED_KEY = 'bob_saved_plan'
export const SAVED_EVENT = 'bob-saved-change'

export interface SavedPlan {
  occasion: string
  guests: number
  date: string
  theatreId: string | null
  slotId: string | null
  packageId: string | null
  addonIds: string[]
}

function read(): SavedPlan | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as SavedPlan) : null
  } catch {
    return null
  }
}

/** The plan saved on the booking page, kept in sync across components. */
export function useSavedPlan() {
  const [plan, setPlan] = useState<SavedPlan | null>(read)
  const { dispatch } = useBooking()
  const navigate = useNavigate()

  useEffect(() => {
    const sync = () => setPlan(read())
    window.addEventListener(SAVED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SAVED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const resume = useCallback(() => {
    const p = read()
    if (!p) return
    dispatch({ type: 'RESET' })
    dispatch({ type: 'SET_OCCASION', occasion: p.occasion })
    dispatch({ type: 'SET_GUESTS', guests: p.guests })
    dispatch({ type: 'SET_DATE', date: p.date })
    if (p.theatreId) dispatch({ type: 'SET_THEATRE_SLOT', theatreId: p.theatreId, theatreSlug: '', slotId: p.slotId ?? '' })
    if (p.packageId) dispatch({ type: 'SET_PACKAGE', packageId: p.packageId })
    if (p.addonIds?.length) dispatch({ type: 'SET_ADDONS', addonIds: p.addonIds })
    dispatch({ type: 'GO_STEP', step: p.theatreId && p.slotId ? 4 : 3 })
    navigate(`/book?occasion=${p.occasion}&guests=${p.guests}&date=${p.date}`)
  }, [dispatch, navigate])

  return { plan, resume }
}
