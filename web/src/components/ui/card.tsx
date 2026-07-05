import type { HTMLAttributes } from 'react'

export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-6 shadow-sm ${className}`}
      {...props}
    />
  )
}

export function CardTitle({
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`mb-4 text-lg font-semibold text-ink ${className}`}
      {...props}
    />
  )
}
