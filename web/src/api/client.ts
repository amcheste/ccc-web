import type { z } from 'zod'
import { RefreshResponseSchema } from './types'

const BASE = '/api/account'

// The access token lives in module memory only — never localStorage —
// so a persistent credential is never exposed to XSS. The refresh
// token is an HttpOnly cookie the browser manages by itself.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function hasAccessToken(): boolean {
  return accessToken !== null
}

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, title: string, detail?: string) {
    super(title)
    this.status = status
    this.detail = detail
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { title?: string; detail?: string }
    return new ApiError(res.status, body.title ?? res.statusText, body.detail)
  } catch {
    return new ApiError(res.status, res.statusText)
  }
}

async function rawFetch(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
}

/** POST /v1/auth/refresh using the HttpOnly cookie. Returns false when
 * there is no valid session. */
export async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${BASE}/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    accessToken = null
    return false
  }
  const body = RefreshResponseSchema.parse(await res.json())
  accessToken = body.access_token
  return true
}

interface RequestOptions<T> {
  method?: string
  body?: unknown
  schema?: z.ZodType<T>
}

/** Typed API call with a single silent refresh-and-retry on 401. */
export async function api<T = void>(
  path: string,
  opts: RequestOptions<T> = {},
): Promise<T> {
  const init: RequestInit = {
    method: opts.method ?? 'GET',
    ...(opts.body !== undefined && {
      body: JSON.stringify(opts.body),
      headers: { 'Content-Type': 'application/json' },
    }),
  }

  let res = await rawFetch(path, init)
  if (res.status === 401 && (await refreshSession())) {
    res = await rawFetch(path, init)
  }
  if (!res.ok) throw await parseError(res)

  if (!opts.schema) return undefined as T
  return opts.schema.parse(await res.json())
}
