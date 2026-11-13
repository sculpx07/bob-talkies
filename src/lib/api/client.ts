import { config } from '@/lib/config'

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const url = `${config.apiBaseUrl}${endpoint}`
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let err: { code: string; message: string; fieldErrors?: Record<string, string> }
    try {
      err = await res.json()
    } catch {
      err = { code: 'NETWORK_ERROR', message: res.statusText }
    }
    throw new ApiError(err.code, err.message, res.status, err.fieldErrors)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { token }),
  post: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: 'POST', body, token }),
  put: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, token }),
  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, token }),
  delete: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
}
