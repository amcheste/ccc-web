import { Card, CardTitle } from '../components/ui/card'
import { useAuth } from '../auth/auth'

// The dashboard is intentionally an empty grid: each future CCC
// service contributes its own tile here as it comes online.
export function HomePage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">
        Welcome back, {user?.display_name}
      </h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardTitle>Accounts</CardTitle>
          <p className="text-sm text-muted">
            Household sign-in is live. Manage your profile and sessions, or
            users if you are an admin.
          </p>
        </Card>
        <Card className="border-dashed bg-transparent">
          <CardTitle className="text-muted">Next service</CardTitle>
          <p className="text-sm text-muted">
            Future CCC services plug their dashboard tiles in here.
          </p>
        </Card>
      </div>
    </div>
  )
}
