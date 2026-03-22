'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Author,
  useDeleteAuthorMutation,
  useGetAuthorsQuery,
} from '@/store/api/authorsApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { AuthorFormDialog } from './AuthorFormDialog'

export function AuthorsList() {
  const t = useTranslations()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetAuthorsQuery({
    page,
    limit: 20,
    search: search || undefined,
  })
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation()
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

  const handleDelete = async (author: Author) => {
    const confirmed = window.confirm(t('common.confirmDelete'))

    if (!confirmed) {
      return
    }

    try {
      await deleteAuthor(author._id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('errors.serverError'))
    }
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
      key: 'countryCode',
      label: 'Country',
      render: (value) => String(value || '—'),
    },
    {
      key: 'isActive',
      label: 'Active',
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

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('authors.title')}
          description={t('authors.description')}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{t('errors.serverError')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('authors.title')}
        description={t('authors.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder={`${t('common.search')} authors...`}
        noDataMessage={t('authors.noAuthors')}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />

      {showDialog && (
        <AuthorFormDialog author={editingAuthor} onClose={handleCloseDialog} />
      )}
    </div>
  )
}
