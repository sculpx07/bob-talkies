import type { UserRef } from '@/admin/types/api'

export type ReviewSource = 'google' | 'website' | 'whatsapp' | 'instagram' | 'other'

/** A website testimonial (bob-admin src/models/review.model.js). */
export interface Review {
  id: string
  name: string
  rating: number
  text: string
  occasion: string
  theatre: { id: string; name: string; slug: string } | null
  /** YYYY-MM-DD */
  date: string
  source: ReviewSource
  isPublished: boolean
  sortOrder: number
  createdBy?: UserRef | null
  updatedBy?: UserRef | null
  createdAt: string
  updatedAt: string
}

export type ReviewInput = Omit<Review, 'id' | 'theatre' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> & {
  theatre: string | null
}

export interface ReviewListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  rating?: number
  isPublished?: boolean
  source?: ReviewSource
  theatre?: string
}

export interface ReviewStats {
  total: number
  published: number
  hidden: number
  averageRating: number
}
