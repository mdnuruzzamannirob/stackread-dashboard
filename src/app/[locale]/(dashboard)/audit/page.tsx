'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function AuditPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.audit')}
      description="Audit logs and activity"
    />
  )
}
