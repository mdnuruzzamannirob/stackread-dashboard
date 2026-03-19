'use client'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
    </div>
  )
}
