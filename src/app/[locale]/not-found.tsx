'use client'

import { EmptyState } from '@/components/common/EmptyState'
import { FileQuestion } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFoundPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <EmptyState
        icon={FileQuestion}
        title={t('errors.notFound')}
        description="The page you are looking for does not exist"
        action={
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Return to Dashboard
          </Link>
        }
      />
    </div>
  )
}
