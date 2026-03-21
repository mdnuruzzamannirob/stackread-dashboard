'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export function ProfileMenu() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Link
        href={`/${locale}/profile`}
        className="block text-sm hover:underline"
      >
        {t('navigation.profile')}
      </Link>
      <Link
        href={`/${locale}/logout`}
        className="block text-sm hover:underline text-red-600"
      >
        {t('navigation.logout')}
      </Link>
    </div>
  )
}
