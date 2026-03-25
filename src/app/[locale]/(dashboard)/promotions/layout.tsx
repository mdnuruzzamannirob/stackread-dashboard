'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('navigation.promotions')}
        description={t('pages.promotionsDescription')}
      />

      <nav className="grid grid-cols-2 gap-4">
        <Link
          href={`/${locale}/promotions/coupons`}
          className="rounded-lg border border-border p-6 hover:bg-muted"
        >
          <h3 className="text-lg font-semibold">{t('coupons.title')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('coupons.description')}
          </p>
        </Link>

        <Link
          href={`/${locale}/promotions/flash-sales`}
          className="rounded-lg border border-border p-6 hover:bg-muted"
        >
          <h3 className="text-lg font-semibold">{t('flashSales.title')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('flashSales.description')}
          </p>
        </Link>
      </nav>

      {children}
    </div>
  )
}
