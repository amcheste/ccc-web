import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../auth/auth'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Field } from '../components/ui/field'

const LoginForm = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type LoginForm = z.infer<typeof LoginForm>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginForm) })

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setServerError(null)
    try {
      await login(username, password)
      void navigate('/', { replace: true })
    } catch (err) {
      setServerError(
        err instanceof ApiError && err.status === 401
          ? 'Wrong username or password.'
          : 'Could not reach the account service.',
      )
    }
  })

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">Command &amp; Control</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Sign in to your household account.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Username" error={errors.username?.message}>
            <Input
              autoComplete="username"
              autoFocus
              {...register('username')}
            />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
          </Field>
          {serverError && (
            <p role="alert" className="text-sm text-red-700">
              {serverError}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </main>
  )
}
