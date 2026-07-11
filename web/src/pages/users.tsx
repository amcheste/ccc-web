import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { api } from '../api/client'
import {
  ResetPasswordResponseSchema,
  UserListSchema,
  UserSchema,
  type User,
} from '../api/types'
import { Button } from '../components/ui/button'
import { Card, CardTitle } from '../components/ui/card'
import { Field } from '../components/ui/field'
import { Input } from '../components/ui/input'

const CreateForm = z.object({
  username: z.string().min(1, 'Required'),
  display_name: z.string().min(1, 'Required'),
  role: z.enum(['admin', 'member']),
})
type CreateForm = z.infer<typeof CreateForm>

export function UsersPage() {
  const queryClient = useQueryClient()
  const [tempPassword, setTempPassword] = useState<{
    username: string
    password: string
  } | null>(null)

  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => api('/v1/users', { schema: UserListSchema }),
  })

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ['users'] })

  const create = useMutation({
    mutationFn: (body: CreateForm) =>
      api('/v1/users', { method: 'POST', body, schema: UserSchema }),
    onSuccess: invalidate,
  })

  const setStatus = useMutation({
    mutationFn: ({ user, status }: { user: User; status: User['status'] }) =>
      api(`/v1/users/${user.id}`, {
        method: 'PATCH',
        body: { status },
        schema: UserSchema,
      }),
    onSuccess: invalidate,
  })

  const resetPassword = useMutation({
    mutationFn: (user: User) =>
      api(`/v1/users/${user.id}/reset-password`, {
        method: 'POST',
        schema: ResetPasswordResponseSchema,
      }),
    onSuccess: (res, user) =>
      setTempPassword({
        username: user.username,
        password: res.temporary_password,
      }),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(CreateForm),
    defaultValues: { role: 'member' },
  })

  const onCreate = handleSubmit(async (values) => {
    const user = await create.mutateAsync(values)
    const res = await resetPassword.mutateAsync(user)
    setTempPassword({
      username: user.username,
      password: res.temporary_password,
    })
    reset({ role: 'member' })
  })

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      {tempPassword && (
        <Card className="border-accent bg-accent-soft">
          <p className="text-sm">
            One-time password for <strong>{tempPassword.username}</strong>:
            <code className="mx-2 rounded-xs bg-white px-2 py-1 font-mono">
              {tempPassword.password}
            </code>
            They must change it at first sign-in. This is shown once.
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setTempPassword(null)}
          >
            Dismiss
          </Button>
        </Card>
      )}

      <Card>
        <CardTitle>Household members</CardTitle>
        {users.isLoading && <p className="text-sm text-muted">Loading…</p>}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-mist">
              <th className="eyebrow py-2 pr-4 font-normal">user</th>
              <th className="eyebrow py-2 pr-4 font-normal">role</th>
              <th className="eyebrow py-2 pr-4 font-normal">status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-mist/60">
            {users.data?.users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-4">
                  <p className="font-medium">{u.display_name}</p>
                  <p className="text-xs text-muted">{u.username}</p>
                </td>
                <td className="py-3 pr-4">{u.role}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      u.status === 'active' ? 'text-accent' : 'text-muted'
                    }
                  >
                    {u.status}
                  </span>
                </td>
                <td className="space-x-2 py-3 text-right">
                  <Button
                    variant="secondary"
                    onClick={() => resetPassword.mutate(u)}
                  >
                    Reset password
                  </Button>
                  <Button
                    variant={u.status === 'active' ? 'danger' : 'secondary'}
                    onClick={() =>
                      setStatus.mutate({
                        user: u,
                        status: u.status === 'active' ? 'disabled' : 'active',
                      })
                    }
                  >
                    {u.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardTitle>Add member</CardTitle>
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Username" error={errors.username?.message}>
              <Input {...register('username')} />
            </Field>
            <Field label="Display name" error={errors.display_name?.message}>
              <Input {...register('display_name')} />
            </Field>
          </div>
          <Field label="Role" error={errors.role?.message}>
            <select
              className="w-full rounded-xs border border-mist bg-white px-3 py-2 text-sm text-ink"
              {...register('role')}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            Create user
          </Button>
        </form>
      </Card>
    </div>
  )
}
