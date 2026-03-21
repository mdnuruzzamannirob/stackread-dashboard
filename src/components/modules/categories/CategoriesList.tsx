'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Category, useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { CategoryFormDialog } from './CategoryFormDialog'

export function CategoriesList() {
  const t = useTranslations()
  const { data, isLoading } = useGetCategoriesQuery({ page: 1, limit: 50 })
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
      key: 'bookCount',
      label: t('categories.bookCount'),
      sortable: true,
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
        title={t('categories.title')}
        description={t('categories.description')}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        searchPlaceholder={`${t('common.search')} categories...`}
        noDataMessage={t('categories.noCategories')}
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
