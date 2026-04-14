'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Book,
  useDeleteBookMutation,
  useGetBooksQuery,
} from '@/store/api/booksApi'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

export function BooksList() {
  const t = useTranslations()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetBooksQuery({
    page,
    limit: 20,
    search: search || undefined,
  })
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)

  const handleAdd = () => {
    router.push('/books/new')
  }

  const handleEdit = (book: Book) => {
    router.push(`/books/${book._id}/edit`)
  }

  const handleDelete = async () => {
    if (!deletingBook) {
      return
    }

    try {
      await deleteBook(deletingBook._id).unwrap()
      toast.success(`Book "${deletingBook.title}" deleted successfully`)
      setDeletingBook(null)
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

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/books/import')}
        >
          Import Books
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={(book) => router.push(`/books/${book._id}`)}
        onDelete={setDeletingBook}
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

      {deletingBook && (
        <ConfirmDialog
          title="Delete book"
          description={`Delete "${deletingBook.title}"? This action cannot be undone.`}
          confirmLabel={t('common.delete')}
          isDangerous
          isLoading={isDeleting}
          onCancel={() => setDeletingBook(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
