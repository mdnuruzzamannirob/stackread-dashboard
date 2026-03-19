'use client'

import {
  Category,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/store/api/categoriesApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parent: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  category?: Category | null
  onClose: () => void
}

export function CategoryFormDialog({
  category,
  onClose,
}: CategoryFormDialogProps) {
  const t = useTranslations()
  const [createCategory] = useCreateCategoryMutation()
  const [updateCategory] = useUpdateCategoryMutation()
  const [isLoading, setIsLoading] = useState(false)
  const { data: categoriesData } = useGetCategoriesQuery({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description,
          parent: category.parent,
        }
      : undefined,
  })

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      if (category?._id) {
        await updateCategory({
          id: category._id,
          body: data,
        }).unwrap()
      } else {
        await createCategory(data).unwrap()
      }
      reset()
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out current category and its children from parent options
  const availableParents =
    categoriesData?.data.filter(
      (cat) =>
        cat._id !== category?._id && !category?.children?.includes(cat._id),
    ) || []

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {category
              ? t('categories.editCategory')
              : t('categories.addCategory')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.title')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Category name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common.description')}
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
              rows={3}
              placeholder="Category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.parentCategory')}
            </label>
            <select
              {...register('parent')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">No parent</option>
              {availableParents.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
