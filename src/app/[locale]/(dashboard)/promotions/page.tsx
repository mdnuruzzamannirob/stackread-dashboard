'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function PromotionsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.promotions')}
      description={t('pages.promotionsDescription')}
    />
  )
}
