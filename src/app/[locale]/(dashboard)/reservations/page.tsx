'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function ReservationsPage() {
  const t = useTranslations()
  return (
    <PageHeader
      title={t('navigation.reservations')}
      description="Reservations management"
    />
  )
}
