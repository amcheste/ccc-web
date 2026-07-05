import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-hunter-500 focus:ring-2 focus:ring-hunter-100 ${className}`}
      {...props}
    />
  )
})
