'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { useTranslations } from 'next-intl'

export default function BooksPage() {
  const t = useTranslations()
  return (
    <PageHeader title={t('navigation.books')} description="Books management" />
  )
}
