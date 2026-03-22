'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Publisher,
  useDeletePublisherMutation,
  useGetPublishersQuery,
} from '@/store/api/publishersApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { PublisherFormDialog } from './PublisherFormDialog'

export function PublishersList() {
  const t = useTranslations()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetPublishersQuery({
    page,
    limit: 20,
    search: search || undefined,
  })
  const [deletePublisher, { isLoading: isDeleting }] =
    useDeletePublisherMutation()
  const [showDialog, setShowDialog] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(
    null,
  )
  const [deletingPublisher, setDeletingPublisher] = useState<Publisher | null>(
    null,
  )

  const handleAdd = () => {
    setEditingPublisher(null)
    setShowDialog(true)
  }

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingPublisher(null)
  }

  const handleDelete = async () => {
    if (!deletingPublisher) {
      return
    }

    try {
      await deletePublisher(deletingPublisher._id).unwrap()
      toast.success(t('common.success'))
      setDeletingPublisher(null)
    } catch {
      toast.error(t('errors.serverError'))
    }
  }

  const columns: DataTableColumn<Publisher>[] = [
    {
      key: 'name',
      label: t('publishers.name'),
      sortable: true,
    },
    {
      key: 'website',
      label: 'Website',
    },
    {
      key: 'country',
      label: 'Country',
      render: (value) => String(value || '—'),
    },
    {
      key: 'foundedYear',
      label: 'Founded',
      render: (value) => (value ? String(value) : '—'),
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
          title={t('publishers.title')}
          description={t('publishers.description')}
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
        title={t('publishers.title')}
        description={t('publishers.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={setDeletingPublisher}
        searchPlaceholder={`${t('common.search')} publishers...`}
        noDataMessage={t('publishers.noPublishers')}
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
        <PublisherFormDialog
          publisher={editingPublisher}
          onClose={handleCloseDialog}
        />
      )}

      {deletingPublisher && (
        <ConfirmDialog
          title={t('common.confirmDelete')}
          description={`Delete publisher "${deletingPublisher.name}"?`}
          isDangerous
          isLoading={isDeleting}
          onCancel={() => setDeletingPublisher(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
