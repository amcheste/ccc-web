import { describe, expect, it } from 'vitest'
import { HttpResponse, http } from 'msw'
import { z } from 'zod'
import { server } from '../mocks/server'
import { ApiError, api, refreshSession, setAccessToken } from './client'

describe('api client', () => {
  it('performs a typed GET with schema validation', async () => {
    server.use(
      http.get('/api/account/v1/ping', () => HttpResponse.json({ value: 42 })),
    )
    const res = await api('/v1/ping', {
      schema: z.object({ value: z.number() }),
    })
    expect(res.value).toBe(42)
  })

  it('attaches the in-memory access token', async () => {
    let seen: string | null = null
    server.use(
      http.get('/api/account/v1/ping', ({ request }) => {
        seen = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )
    setAccessToken('tok-123')
    await api('/v1/ping', { schema: z.object({}) })
    expect(seen).toBe('Bearer tok-123')
  })

  it('silently refreshes and retries once on 401', async () => {
    let calls = 0
    server.use(
      http.get('/api/account/v1/ping', ({ request }) => {
        calls++
        if (request.headers.get('Authorization') !== 'Bearer fresh') {
          return HttpResponse.json({ title: 'expired' }, { status: 401 })
        }
        return HttpResponse.json({ ok: true })
      }),
      http.post('/api/account/v1/auth/refresh', () =>
        HttpResponse.json({ access_token: 'fresh' }),
      ),
    )
    setAccessToken('stale')
    const res = await api('/v1/ping', { schema: z.object({ ok: z.boolean() }) })
    expect(res.ok).toBe(true)
    expect(calls).toBe(2)
  })

  it('throws ApiError with problem details on failure', async () => {
    server.use(
      http.get('/api/account/v1/ping', () =>
        HttpResponse.json(
          { title: 'Nope', detail: 'not today' },
          { status: 403 },
        ),
      ),
      http.post('/api/account/v1/auth/refresh', () =>
        HttpResponse.json({ title: 'No session' }, { status: 401 }),
      ),
    )
    const err = await api('/v1/ping', { schema: z.object({}) }).catch(
      (e: unknown) => e,
    )
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(403)
    expect((err as ApiError).message).toBe('Nope')
  })

  it('reports no session when refresh fails', async () => {
    server.use(
      http.post('/api/account/v1/auth/refresh', () =>
        HttpResponse.json({ title: 'No session' }, { status: 401 }),
      ),
    )
    expect(await refreshSession()).toBe(false)
  })
})
