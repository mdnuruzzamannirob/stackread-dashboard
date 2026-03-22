'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Book,
  useDeleteBookMutation,
  useGetBooksQuery,
} from '@/store/api/booksApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { BookFormDialog } from './BookFormDialog'

export function BooksList() {
  const t = useTranslations()
  const { data, isLoading, isError, refetch } = useGetBooksQuery({
    page: 1,
    limit: 20,
  })
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()
  const [showDialog, setShowDialog] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const handleAdd = () => {
    setEditingBook(null)
    setShowDialog(true)
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingBook(null)
  }

  const handleDelete = async (book: Book) => {
    const confirmed = window.confirm(t('common.confirmDelete'))

    if (!confirmed) {
      return
    }

    try {
      await deleteBook(book._id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('errors.serverError'))
    }
  }

  const columns: DataTableColumn<Book>[] = [
    {
      key: 'title',
      label: t('books.title'),
      sortable: true,
    },
    {
      key: 'isbn',
      label: t('books.isbn'),
      sortable: true,
      render: (value) => String(value || '—'),
    },
    {
      key: 'language',
      label: 'Language',
    },
    {
      key: 'files',
      label: 'Formats',
      render: (_, row) => {
        const files = Array.isArray(row.files) ? row.files : []

        if (!files.length) {
          return '—'
        }

        const formats = files
          .map((file) => {
            const mime = file.contentType?.toLowerCase() || ''
            if (mime.includes('pdf')) return 'PDF'
            if (mime.includes('epub')) return 'EPUB'
            return file.contentType || 'File'
          })
          .filter((format, index, all) => all.indexOf(format) === index)

        return formats.join(', ')
      },
    },
    {
      key: 'featured',
      label: t('books.featured'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
    {
      key: 'isAvailable',
      label: t('books.available'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('books.title')}
          description={t('books.description')}
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
        title={t('books.title')}
        description={t('books.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder={`${t('common.search')} books...`}
        noDataMessage={t('books.noBooks')}
      />

      {showDialog && (
        <BookFormDialog book={editingBook} onClose={handleCloseDialog} />
      )}
    </div>
  )
}
