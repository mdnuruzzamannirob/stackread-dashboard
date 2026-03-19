'use client'

import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations()

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Phase 1 Placeholder
        </p>
      </div>
    </div>
  )
}
