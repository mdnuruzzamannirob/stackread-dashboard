'use client'

import { cn } from '@/lib/utils'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function OTPInput({
  value,
  onChange,
  placeholder = '000000',
  disabled,
  className,
  id,
}: OTPInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={value}
      onChange={(event) => {
        const numericValue = event.target.value.replace(/\D/g, '')
        onChange(numericValue.slice(0, 6))
      }}
      onFocus={(event) => event.currentTarget.select()}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'h-12 w-full rounded-lg border border-input bg-background px-4 text-center text-2xl font-semibold tracking-[0.4em] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  )
}
