'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Category,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from '@/store/api/categoriesApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { CategoryFormDialog } from './CategoryFormDialog'

export function CategoriesList() {
  const t = useTranslations()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetCategoriesQuery({
    page,
    limit: 20,
    search: search || undefined,
  })
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation()
  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleAdd = () => {
    setEditingCategory(null)
    setShowDialog(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingCategory(null)
  }

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(t('common.confirmDelete'))

    if (!confirmed) {
      return
    }

    try {
      await deleteCategory(category._id).unwrap()
      toast.success(t('common.success'))
    } catch {
      toast.error(t('errors.serverError'))
    }
  }

  const columns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      label: t('categories.title'),
      sortable: true,
    },
    {
      key: 'description',
      label: t('common.description'),
    },
    {
      key: 'booksCount',
      label: t('categories.bookCount'),
      sortable: true,
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
          title={t('categories.title')}
          description={t('categories.description')}
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
        title={t('categories.title')}
        description={t('categories.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder={`${t('common.search')} categories...`}
        noDataMessage={t('categories.noCategories')}
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
        <CategoryFormDialog
          category={editingCategory}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  )
}
