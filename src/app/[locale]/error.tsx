'use client'

import { EmptyState } from '@/components/common/EmptyState'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <EmptyState
        icon={AlertTriangle}
        title={t('errors.serverError')}
        description={error.message}
        action={
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-block rounded bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              Back to Dashboard
            </Link>
          </div>
        }
      />
    </div>
  )
}
