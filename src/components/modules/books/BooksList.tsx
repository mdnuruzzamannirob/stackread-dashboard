'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Book, useGetBooksQuery } from '@/store/api/booksApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { BookFormDialog } from './BookFormDialog'

export function BooksList() {
  const t = useTranslations()
  const { data, isLoading } = useGetBooksQuery({ page: 1, limit: 20 })
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
    },
    {
      key: 'publisher',
      label: t('books.publisher'),
    },
    {
      key: 'availableCopies',
      label: t('books.availableCopies'),
      sortable: true,
      render: (value, row) => `${String(value)}/${row.totalCopies}`,
    },
    {
      key: 'featured',
      label: t('books.featured'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
    {
      key: 'available',
      label: t('books.available'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('books.title')}
        description={t('books.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder={`${t('common.search')} books...`}
        noDataMessage={t('books.noBooks')}
      />

      {showDialog && (
        <BookFormDialog book={editingBook} onClose={handleCloseDialog} />
      )}
    </div>
  )
}
