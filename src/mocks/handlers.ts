import { http, HttpResponse } from 'msw'
import { config } from '@/lib/config'

/** Mocks answer at the same address the site calls, whatever VITE_API_BASE_URL is. */
export const BASE = config.apiBaseUrl

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ok(data: any) {
  return HttpResponse.json(data)
}

export const handlers = [
  // POST /track/event
  http.post(`${BASE}/track/event`, async () => {
    return ok({ success: true })
  }),

  // GET /c/:code (short links)
  http.get(`${BASE}/c/:code`, async () => {
    return HttpResponse.redirect('/', 302)
  }),
]
