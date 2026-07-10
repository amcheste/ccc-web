import type { ButtonHTMLAttributes } from 'react'

// Accent discipline: buttons are chrome, so the primary action is ink,
// not hunter green. Rust (the brand's alternate accent) marks
// destructive actions.
const variants = {
  primary:
    'bg-ink text-paper hover:bg-graphite disabled:bg-mist disabled:text-muted',
  secondary:
    'border border-mist bg-white text-ink hover:bg-paper disabled:text-muted',
  danger:
    'bg-rust text-paper hover:opacity-90 disabled:bg-mist disabled:text-muted',
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
      className={`rounded-xs px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
