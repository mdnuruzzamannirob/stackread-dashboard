'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function SubscriptionsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.subscriptions')}
      description={t('pages.subscriptionsDescription')}
    />
  )
}
