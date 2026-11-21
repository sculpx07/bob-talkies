/** Shapes shared by every bob-admin list endpoint. */

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** List replies look like { <key>: T[], pagination }, e.g. { theatres: [...], pagination }. */
export type Paginated<Key extends string, T> = { [K in Key]: T[] } & { pagination: Pagination }

/** Common list query params. `sort` is a field name, prefixed with "-" for descending. */
export interface ListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
}

/** Who made / last changed a record. */
export interface UserRef {
  id: string
  name: string
  email?: string
}
