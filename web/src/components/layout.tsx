import { NavLink, Navigate, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/auth'
import { Button } from './ui/button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-hunter-100 text-hunter-800'
      : 'text-neutral-600 hover:bg-neutral-100'
  }`

export function Layout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-neutral-200 bg-white p-4">
        <p className="mb-6 px-3 text-sm font-semibold tracking-wide">
          Command &amp; Control
        </p>
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
        <div className="border-t border-neutral-100 pt-4">
          <p className="mb-2 px-3 text-xs text-neutral-500">{user.username}</p>
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
