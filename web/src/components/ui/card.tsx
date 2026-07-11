import type { HTMLAttributes } from 'react'

export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xs border border-mist bg-white p-6 ${className}`}
      {...props}
    />
  )
}

export function CardTitle({
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`mb-4 text-lg font-semibold ${className}`} {...props} />
}
