import { createBrowserRouter } from 'react-router'
import { AdminOnly, Layout } from './components/layout'
import { LoginPage } from './pages/login'
import { HomePage } from './pages/home'
import { ProfilePage } from './pages/profile'
import { UsersPage } from './pages/users'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profile', element: <ProfilePage /> },
      {
        element: <AdminOnly />,
        children: [{ path: 'users', element: <UsersPage /> }],
      },
    ],
  },
])
