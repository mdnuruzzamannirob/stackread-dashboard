'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Author, useGetAuthorsQuery } from '@/store/api/authorsApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { AuthorFormDialog } from './AuthorFormDialog'

export function AuthorsList() {
  const t = useTranslations()
  const { data, isLoading } = useGetAuthorsQuery({ page: 1, limit: 20 })
  const [showDialog, setShowDialog] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)

  const handleAdd = () => {
    setEditingAuthor(null)
    setShowDialog(true)
  }

  const handleEdit = (author: Author) => {
    setEditingAuthor(author)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingAuthor(null)
  }

  const columns: DataTableColumn<Author>[] = [
    {
      key: 'name',
      label: t('authors.name'),
      sortable: true,
    },
    {
      key: 'bio',
      label: t('authors.bio'),
    },
    {
      key: 'verified',
      label: t('authors.verified'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) =>
        value ? new Date(String(value)).toLocaleDateString() : '—',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('authors.title')}
        description={t('authors.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder={`${t('common.search')} authors...`}
        noDataMessage={t('authors.noAuthors')}
      />

      {showDialog && (
        <AuthorFormDialog author={editingAuthor} onClose={handleCloseDialog} />
      )}
    </div>
  )
}
