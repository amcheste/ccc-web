import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { api } from '../api/client'
import { SessionListSchema } from '../api/types'
import { useAuth } from '../auth/auth'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { Field } from '../components/ui/field'
import { Input } from '../components/ui/input'

const PasswordForm = z
  .object({
    current_password: z.string().min(1, 'Required'),
    new_password: z.string().min(12, 'At least 12 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.new_password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type PasswordForm = z.infer<typeof PasswordForm>

export function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [changed, setChanged] = useState(false)

  const sessions = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api('/v1/me/sessions', { schema: SessionListSchema }),
  })

  const revoke = useMutation({
    mutationFn: (id: string) =>
      api(`/v1/me/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(PasswordForm) })

  const onChangePassword = handleSubmit(async (values) => {
    await api('/v1/me/password', {
      method: 'PUT',
      body: {
        current_password: values.current_password,
        new_password: values.new_password,
      },
    })
    reset()
    setChanged(true)
  })

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <Card>
        <CardTitle>Account</CardTitle>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-neutral-500">Username</dt>
          <dd>{user?.username}</dd>
          <dt className="text-neutral-500">Display name</dt>
          <dd>{user?.display_name}</dd>
          <dt className="text-neutral-500">Role</dt>
          <dd>{user?.role}</dd>
        </dl>
      </Card>

      <Card>
        <CardTitle>Change password</CardTitle>
        <form onSubmit={onChangePassword} className="space-y-4">
          <Field
            label="Current password"
            error={errors.current_password?.message}
          >
            <Input
              type="password"
              autoComplete="current-password"
              {...register('current_password')}
            />
          </Field>
          <Field label="New password" error={errors.new_password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...register('new_password')}
            />
          </Field>
          <Field label="Confirm new password" error={errors.confirm?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
            />
          </Field>
          {changed && (
            <p className="text-sm text-hunter-700">
              Password changed. Other sessions were signed out.
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            Change password
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>Sessions</CardTitle>
        {sessions.isLoading && (
          <p className="text-sm text-neutral-500">Loading…</p>
        )}
        <ul className="divide-y divide-neutral-100">
          {sessions.data?.sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">
                  {s.device_name ?? 'Unknown device'}
                  {s.current && (
                    <span className="ml-2 rounded bg-hunter-100 px-1.5 py-0.5 text-xs text-hunter-800">
                      this device
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  expires {new Date(s.expires_at).toLocaleDateString()}
                </p>
              </div>
              {!s.current && (
                <Button
                  variant="secondary"
                  onClick={() => revoke.mutate(s.id)}
                  disabled={revoke.isPending}
                >
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
