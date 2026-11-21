import { env } from '@/admin/config/env'
import { ApiError } from './errors'
import { tokens } from './tokens'

/*
 * Fetch wrapper for the bob-admin backend.
 *  - adds the access token
 *  - on 401, refreshes the tokens once (shared by parallel requests) and retries
 *  - unwraps { success, data } and throws ApiError for failures
 */

type QueryValue = string | number | boolean | null | undefined | Array<string | number>
export type Query = Record<string, QueryValue>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Query
  body?: unknown
  /** false for sign-in / refresh, which must not send or refresh tokens */
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(env.apiUrl + path)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value))
  })
  return url.toString()
}

// ---------------------------------------------------------------- token refresh

type RefreshResult = 'ok' | 'invalid' | 'network'
let refreshInFlight: Promise<RefreshResult> | null = null

/** Exchanges the refresh token for a new pair. Parallel callers share one request. */
export function refreshTokens(): Promise<RefreshResult> {
  const refreshToken = tokens.getRefresh()
  if (!refreshToken) return Promise.resolve('invalid')

  refreshInFlight ??= (async (): Promise<RefreshResult> => {
    try {
      const res = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return 'invalid'
      const json = await res.json()
      tokens.set(json.data.accessToken, json.data.refreshToken)
      return 'ok'
    } catch {
      return 'network'
    }
  })().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

// ---------------------------------------------------------------- request

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = 'GET', query, body, auth = true, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // the browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const accessToken = tokens.getAccess()
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), { method, headers, body: payload, signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.')
  }

  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await refreshTokens()
    if (refreshed === 'ok') return request<T>(path, options, true)
    if (refreshed === 'invalid') tokens.endSession()
  }

  const json = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw ApiError.fromResponse(res.status, json)

  // { success, data } -> data; replies without data (e.g. deletes) return the whole body
  return (json && 'data' in json ? json.data : json) as T
}

/** Fetches a file (e.g. a CSV export) with the same auth and refresh handling. */
async function download(path: string, query?: Query, isRetry = false): Promise<Blob> {
  const accessToken = tokens.getAccess()
  let res: Response
  try {
    res = await fetch(buildUrl(path, query), { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection and try again.')
  }
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshTokens()
    if (refreshed === 'ok') return download(path, query, true)
    if (refreshed === 'invalid') tokens.endSession()
  }
  if (!res.ok) throw ApiError.fromResponse(res.status, await res.json().catch(() => null))
  return res.blob()
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, options?: Pick<RequestOptions, 'auth'>) =>
    request<T>(path, { method: 'POST', body, ...options }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', body }),
  /** multipart upload, e.g. upload('/theatres/1/images', 'images', files) */
  upload: <T>(path: string, field: string, files: File[]) => {
    const form = new FormData()
    files.forEach((file) => form.append(field, file))
    return request<T>(path, { method: 'POST', body: form })
  },
  download,
}
