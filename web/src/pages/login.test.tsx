import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from '../auth/auth'
import { LoginPage } from './login'

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/', element: <p>dashboard</p> },
    ],
    { initialEntries: ['/login'] },
  )
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  it('signs in with the mock credentials and navigates home', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Username'), 'alan')
    await user.type(screen.getByLabelText('Password'), 'hunter2')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('dashboard')).toBeInTheDocument()
  })

  it('shows an error for bad credentials', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Username'), 'alan')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Wrong username or password.',
    )
  })
})
