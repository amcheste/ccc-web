import { HttpResponse, http } from 'msw'
import type { Session, User } from '../api/types'

// In-memory fixture state, reset on reload. Sign in as alan/hunter2
// (admin) or sam/hunter2 (member).
const users = new Map<string, User & { password: string }>([
  [
    'u-1',
    {
      id: 'u-1',
      username: 'alan',
      display_name: 'Alan',
      role: 'admin',
      status: 'active',
      created_at: '2026-07-01T12:00:00Z',
      password: 'hunter2',
    },
  ],
  [
    'u-2',
    {
      id: 'u-2',
      username: 'sam',
      display_name: 'Sam',
      role: 'member',
      status: 'active',
      created_at: '2026-07-02T12:00:00Z',
      password: 'hunter2',
    },
  ],
])

const sessions: Session[] = [
  {
    id: 's-1',
    device_name: 'This browser',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    current: true,
  },
  {
    id: 's-2',
    device_name: 'Kitchen tablet',
    issued_at: '2026-07-01T09:00:00Z',
    expires_at: '2026-07-31T09:00:00Z',
    current: false,
  },
]

let signedInUserId: string | null = null
let nextId = 3

function publicUser({
  password: _pw,
  ...u
}: User & { password: string }): User {
  return u
}

const BASE = '/api/account/v1'

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const { username, password } = (await request.json()) as {
      username: string
      password: string
    }
    const user = [...users.values()].find(
      (u) => u.username === username && u.password === password,
    )
    if (!user || user.status !== 'active') {
      return HttpResponse.json(
        { title: 'Invalid credentials' },
        { status: 401 },
      )
    }
    signedInUserId = user.id
    return HttpResponse.json({
      access_token: `mock-token-${user.id}`,
      user: publicUser(user),
    })
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    if (!signedInUserId) {
      return HttpResponse.json({ title: 'No session' }, { status: 401 })
    }
    return HttpResponse.json({ access_token: `mock-token-${signedInUserId}` })
  }),

  http.post(`${BASE}/auth/logout`, () => {
    signedInUserId = null
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/me`, () => {
    const user = signedInUserId ? users.get(signedInUserId) : undefined
    if (!user) {
      return HttpResponse.json({ title: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(publicUser(user))
  }),

  http.put(
    `${BASE}/me/password`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${BASE}/me/sessions`, () => HttpResponse.json({ sessions })),

  http.delete(`${BASE}/me/sessions/:id`, ({ params }) => {
    const idx = sessions.findIndex((s) => s.id === params.id)
    if (idx >= 0) sessions.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${BASE}/users`, () =>
    HttpResponse.json({ users: [...users.values()].map(publicUser) }),
  ),

  http.post(`${BASE}/users`, async ({ request }) => {
    const body = (await request.json()) as {
      username: string
      display_name: string
      role: User['role']
    }
    const id = `u-${nextId++}`
    const user = {
      id,
      ...body,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      password: 'changeme',
    }
    users.set(id, user)
    return HttpResponse.json(publicUser(user), { status: 201 })
  }),

  http.patch(`${BASE}/users/:id`, async ({ params, request }) => {
    const user = users.get(params.id as string)
    if (!user) {
      return HttpResponse.json({ title: 'Not found' }, { status: 404 })
    }
    const body = (await request.json()) as Partial<User>
    Object.assign(user, body)
    return HttpResponse.json(publicUser(user))
  }),

  http.post(`${BASE}/users/:id/reset-password`, () =>
    HttpResponse.json({
      temporary_password: `temp-${Math.random().toString(36).slice(2, 10)}`,
    }),
  ),
]
