'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function ProfilePage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.profile')}
      description={t('pages.profileDescription')}
    />
  )
}
