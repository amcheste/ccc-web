import { NavLink, Navigate, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/auth'
import { Button } from './ui/button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xs px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-mist/60 text-ink' : 'text-graphite hover:bg-paper'
  }`

export function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading…
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-mist bg-white p-4">
        <div className="mb-8 flex items-center gap-2.5 px-3">
          <img src="/favicon.svg" alt="" className="h-6 w-6" />
          <span className="eyebrow">command &amp; control</span>
        </div>
        <nav className="flex-1 space-y-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          {user.role === 'admin' && (
            <NavLink to="/users" className={linkClass}>
              Users
            </NavLink>
          )}
        </nav>
        <div className="border-t border-mist pt-4">
          <p className="mb-2 px-3 font-mono text-xs text-muted">
            {user.username}
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              void logout().then(() => navigate('/login'))
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminOnly() {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
