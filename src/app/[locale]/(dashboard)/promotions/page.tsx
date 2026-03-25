'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

export default function PromotionsPage() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        {t('pages.promotionsDescription')}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/promotions/coupons`}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          {t('coupons.title')}
        </Link>
        <Link
          href={`/${locale}/promotions/flash-sales`}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          {t('flashSales.title')}
        </Link>
      </div>
    </div>
  )
}
