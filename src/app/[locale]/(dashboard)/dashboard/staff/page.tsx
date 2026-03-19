'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function StaffPage() {
  const t = useTranslations()
  return (
    <PageHeader title={t('navigation.staff')} description="Staff management" />
  )
}
