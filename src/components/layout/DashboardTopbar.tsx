'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function DashboardTopbar() {
  const t = useTranslations()

  return (
    <header className="fixed top-0 right-0 left-0 h-16 border-b border-border bg-background flex items-center justify-between px-6 z-50">
      <div className="text-xl font-bold">Stackread Admin</div>
      <div className="flex items-center gap-4">
        <Link href="/profile">{t('navigation.profile')}</Link>
      </div>
    </header>
  )
}
