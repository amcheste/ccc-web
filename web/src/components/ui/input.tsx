import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-xs border border-mist bg-white px-3 py-2 text-sm text-ink outline-none focus:border-graphite focus:ring-2 focus:ring-ink/10 ${className}`}
      {...props}
    />
  )
})
