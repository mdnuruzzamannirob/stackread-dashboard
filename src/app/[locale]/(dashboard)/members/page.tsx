'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function MembersPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.members')}
      description="Members management"
    />
  )
}
