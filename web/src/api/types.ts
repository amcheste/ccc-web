import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  display_name: z.string(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'disabled']),
  created_at: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: UserSchema,
  must_change_password: z.boolean().optional(),
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
})

export const SessionSchema = z.object({
  id: z.string(),
  device_name: z.string().nullable(),
  issued_at: z.string(),
  expires_at: z.string(),
  current: z.boolean(),
})
export type Session = z.infer<typeof SessionSchema>

export const UserListSchema = z.object({ users: z.array(UserSchema) })
export const SessionListSchema = z.object({ sessions: z.array(SessionSchema) })

export const ResetPasswordResponseSchema = z.object({
  temporary_password: z.string(),
})
