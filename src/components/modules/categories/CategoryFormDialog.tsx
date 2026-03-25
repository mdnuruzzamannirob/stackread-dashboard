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
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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

  const [formData, setFormData] = useState<CategoryFormData>(
    category
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
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    fieldName: string,
  ) => {
    const target = e.target as any
    const value =
      target.type === 'checkbox'
        ? target.checked
        : fieldName === 'sortOrder'
          ? parseInt(target.value, 10)
          : target.value
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    const validation = categorySchema.safeParse(formData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || 'general'
        errors[path] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const data = validation.data
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
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        sortOrder: 0,
        isActive: true,
      })
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
          onSubmit={onSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div>
            <Label className="mb-2 block">
              {t('categories.title')}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleFieldChange(e, 'name')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.name)}
              placeholder="Category name (2-120 characters)"
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <Label className="mb-2 block">Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => handleFieldChange(e, 'slug')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.slug)}
              placeholder="category-slug"
            />
            <FieldError message={fieldErrors.slug} />
          </div>

          <div>
            <Label className="mb-2 block">{t('common.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleFieldChange(e, 'description')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.description)}
              rows={3}
              placeholder="Category description (3-2000 characters)"
            />
            <FieldError message={fieldErrors.description} />
          </div>

          <div>
            <Label className="mb-2 block">
              {t('categories.parentCategory')}
            </Label>
            <Select
              value={formData.parentId}
              onChange={(e) => handleFieldChange(e, 'parentId')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.parentId)}
            >
              <option value="">No parent</option>
              {availableParents.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            <FieldError message={fieldErrors.parentId} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Sort Order</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleFieldChange(e, 'sortOrder')}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.sortOrder)}
                min={0}
              />
              <FieldError message={fieldErrors.sortOrder} />
            </div>

            <div>
              <Label className="mb-2 block">Status</Label>
              <Label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => handleFieldChange(e as any, 'isActive')}
                  disabled={isLoading}
                />
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
