import type { UserRef } from '@/admin/types/api'

/** Theatre from the bob-admin backend (src/models/theatre.model.js). Money is paise. */
export interface Theatre {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  capacityMin: number
  capacityMax: number
  includedGuests: number
  screenSize: string
  resolution: string
  soundSystem: string
  seatingType: string
  facilities: string[]
  suitableFor: string[]
  weekdayPricePaise: number
  weekendPricePaise: number
  extraGuestPricePaise: number
  /** lower of weekday / weekend */
  startingPricePaise: number
  durationNote: string
  images: string[]
  videoUrl: string
  currentOffer: string
  locationId: string
  sortOrder: number
  isActive: boolean
  /** populated on the detail endpoint, an id (or null) in lists */
  createdBy: UserRef | string | null
  updatedBy: UserRef | string | null
  createdAt: string
  updatedAt: string
}

/** Fields the create / update endpoints accept. */
export type TheatreInput = Omit<
  Theatre,
  'id' | 'startingPricePaise' | 'images' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'
>

export interface TheatreListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  isActive?: boolean
}
