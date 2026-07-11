import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, refreshSession, setAccessToken } from '../api/client'
import { LoginResponseSchema, UserSchema, type User } from '../api/types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On first load, try to resume the session from the refresh cookie.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        if (await refreshSession()) {
          const me = await api('/v1/me', { schema: UserSchema })
          if (!cancelled) setUser(me)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await api('/v1/auth/login', {
      method: 'POST',
      body: { username, password },
      schema: LoginResponseSchema,
    })
    setAccessToken(res.access_token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/v1/auth/logout', { method: 'POST' })
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
