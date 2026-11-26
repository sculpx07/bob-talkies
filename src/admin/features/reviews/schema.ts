import { z } from 'zod'
import { todayISO } from '@/admin/lib/utils/date'
import type { Review, ReviewInput } from './types'

/** Review form. Limits mirror the backend. */
export const reviewFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  rating: z.number().int().min(1, 'Pick a rating').max(5),
  text: z.string().trim().min(10, 'Review must be at least 10 characters').max(1500),
  occasion: z.string().trim().max(60),
  theatre: z.string(),
  date: z.string().min(1, 'Pick a date'),
  source: z.enum(['google', 'website', 'whatsapp', 'instagram', 'other']),
  isPublished: z.boolean(),
  sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

export const REVIEW_FORM_FIELDS = Object.keys(reviewFormSchema.shape)

export const reviewToForm = (r?: Review): ReviewFormValues => ({
  name: r?.name ?? '',
  rating: r?.rating ?? 5,
  text: r?.text ?? '',
  occasion: r?.occasion ?? '',
  theatre: r?.theatre?.id ?? '',
  date: r?.date ?? todayISO(),
  source: r?.source ?? 'google',
  isPublished: r?.isPublished ?? true,
  sortOrder: r?.sortOrder ?? 0,
})

export const formToReview = (v: ReviewFormValues): ReviewInput => ({ ...v, theatre: v.theatre || null })
