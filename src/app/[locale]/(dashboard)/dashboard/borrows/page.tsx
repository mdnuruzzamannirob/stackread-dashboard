'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function BorrowsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.borrows')}
      description="Borrows management"
    />
  )
}
