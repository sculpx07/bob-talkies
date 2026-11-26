/** GET /reviews: published testimonials plus the overall rating shown above them. */
export interface Review {
  id: string
  name: string
  rating: number
  text: string
  occasion: string
  theatreName: string
  date: string
}

export interface ReviewData {
  averageRating: number
  totalCount: number
  data: Review[]
}
