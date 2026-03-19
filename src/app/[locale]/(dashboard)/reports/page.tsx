'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function ReportsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.reports')}
      description="Reports and analytics"
    />
  )
}
