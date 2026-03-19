'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function PaymentsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.payments')}
      description="Payments management"
    />
  )
}
