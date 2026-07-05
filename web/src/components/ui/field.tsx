import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-sm text-red-700">{error}</span>
      )}
    </label>
  )
}
