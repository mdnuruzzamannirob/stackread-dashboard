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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetBooksQuery({
    page,
    limit: 20,
    search: search || undefined,
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
    refetch()
  }

  const handleDelete = async (book: Book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the book "${book.title}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteBook(book._id).unwrap()
      toast.success(`Book "${book.title}" deleted successfully`)
      refetch()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to delete book. Please try again.'
      toast.error(errorMessage)
      console.error('Delete book error:', error)
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
            const format = file.format?.toLowerCase() || ''
            if (format === 'pdf' || format.includes('pdf')) return 'PDF'
            if (format === 'epub' || format.includes('epub')) return 'EPUB'
            return file.format || 'File'
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
        <BookFormDialog book={editingBook} onClose={handleCloseDialog} />
      )}
    </div>
  )
}
