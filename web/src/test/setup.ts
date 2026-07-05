import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/server'
import { setAccessToken } from '../api/client'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  setAccessToken(null)
})
afterAll(() => server.close())
