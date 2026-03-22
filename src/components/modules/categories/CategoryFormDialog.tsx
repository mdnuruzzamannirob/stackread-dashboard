'use client'

import { FieldError } from '@/components/common/FieldError'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
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
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div>
            <Label className="mb-2 block">
              {t('categories.title')}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('name')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.name)}
              placeholder="Category name (2-120 characters)"
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label className="mb-2 block">Slug</Label>
            <Input
              {...register('slug')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.slug)}
              placeholder="category-slug"
            />
            <FieldError message={errors.slug?.message} />
          </div>

          <div>
            <Label className="mb-2 block">{t('common.description')}</Label>
            <Textarea
              {...register('description')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.description)}
              rows={3}
              placeholder="Category description (3-2000 characters)"
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div>
            <Label className="mb-2 block">
              {t('categories.parentCategory')}
            </Label>
            <Select
              {...register('parentId')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.parentId)}
            >
              <option value="">No parent</option>
              {availableParents.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.parentId?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Sort Order</Label>
              <Input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                disabled={isLoading}
                aria-invalid={Boolean(errors.sortOrder)}
                min={0}
              />
              <FieldError message={errors.sortOrder?.message} />
            </div>

            <div>
              <Label className="mb-2 block">Status</Label>
              <Label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox {...register('isActive')} disabled={isLoading} />
                <span>Active</span>
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
