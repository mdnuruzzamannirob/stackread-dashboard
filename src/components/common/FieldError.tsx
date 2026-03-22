import { AlertCircle } from 'lucide-react'

interface FieldErrorProps {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p className="mt-1 inline-flex items-start gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  )
}
