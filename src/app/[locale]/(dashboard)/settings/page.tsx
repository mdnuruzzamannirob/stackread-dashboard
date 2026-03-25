'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.settings')}
      description={t('pages.settingsDescription')}
    />
  )
}
