import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary:
    'bg-hunter-700 text-white hover:bg-hunter-600 disabled:bg-neutral-300',
  secondary:
    'border border-neutral-300 bg-white text-ink hover:bg-neutral-100 disabled:text-neutral-400',
  danger: 'bg-red-700 text-white hover:bg-red-600 disabled:bg-neutral-300',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
