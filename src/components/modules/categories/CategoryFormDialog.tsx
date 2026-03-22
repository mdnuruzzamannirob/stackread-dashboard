'use client'

import {
  Category,
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/store/api/categoriesApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Match backend validation exactly
const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must not exceed 120 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(140, 'Slug must not exceed 140 characters')
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens',
    )
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  parentId: z.string().optional().or(z.literal('')),
  sortOrder: z
    .number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order must be 0 or greater')
    .default(0),
  isActive: z.boolean().default(true),
})

type CategoryFormData = z.input<typeof categorySchema>
type CategoryFormValues = z.output<typeof categorySchema>

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
  } = useForm<CategoryFormData, undefined, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onBlur',
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug || '',
          description: category.description || '',
          parentId: category.parentId || '',
          sortOrder: category.sortOrder ?? 0,
          isActive: category.isActive ?? true,
        }
      : {
          name: '',
          slug: '',
          description: '',
          parentId: '',
          sortOrder: 0,
          isActive: true,
        },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
        parentId: data.parentId || undefined,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      }

      if (category?._id) {
        await updateCategory({
          id: category._id,
          body: payload,
        }).unwrap()
      } else {
        await createCategory(payload).unwrap()
      }

      toast.success(
        category
          ? t('common.updatedSuccessfully')
          : t('common.createdSuccessfully'),
      )
      reset()
      onClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.serverError')
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const availableParents =
    categoriesData?.data.filter((cat) => cat._id !== category?._id) || []

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">
            {category
              ? t('categories.editCategory')
              : t('categories.addCategory')}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-muted rounded transition disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('categories.title')}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.name
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              placeholder="Category name (2-120 characters)"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              {...register('slug')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.slug
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              placeholder="category-slug"
            />
            {errors.slug && (
              <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.description')}
            </label>
            <textarea
              {...register('description')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background resize-none transition ${
                errors.description
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              rows={3}
              placeholder="Category description (3-2000 characters)"
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('categories.parentCategory')}
            </label>
            <select
              {...register('parentId')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.parentId
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
            >
              <option value="">No parent</option>
              {availableParents.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="text-red-600 text-xs mt-1">
                {errors.parentId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sort Order
              </label>
              <input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.sortOrder
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                min={0}
              />
              {errors.sortOrder && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>

            {/* Active */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  disabled={isLoading}
                  className="rounded border-border cursor-pointer disabled:opacity-50"
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
