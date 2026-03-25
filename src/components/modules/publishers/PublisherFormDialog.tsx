'use client'

import { FieldError } from '@/components/common/FieldError'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Publisher,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
} from '@/store/api/publishersApi'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

// Match backend validation exactly
const publisherSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must not exceed 200 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(220, 'Slug must not exceed 220 characters')
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens',
    ),
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  logoPublicId: z
    .string()
    .trim()
    .max(300, 'Logo public ID must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .max(500, 'URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .max(800)
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  foundedYear: z
    .number()
    .int('Founded year must be an integer')
    .min(1000, 'Founded year must be 1000 or later')
    .max(new Date().getFullYear(), `Founded year cannot be in the future`)
    .optional(),
  isActive: z.boolean().default(true),
})

type PublisherFormData = z.input<typeof publisherSchema>
type PublisherFormValues = z.output<typeof publisherSchema>

interface PublisherFormDialogProps {
  publisher?: Publisher | null
  onClose: () => void
}

export function PublisherFormDialog({
  publisher,
  onClose,
}: PublisherFormDialogProps) {
  const t = useTranslations()
  const [createPublisher] = useCreatePublisherMutation()
  const [updatePublisher] = useUpdatePublisherMutation()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<PublisherFormData>(
    publisher
      ? {
          name: publisher.name,
          slug: publisher.slug,
          description: publisher.description || '',
          website: publisher.website || '',
          logoPublicId: publisher.logo?.publicId || '',
          logoUrl: publisher.logo?.url || '',
          country: publisher.country || '',
          foundedYear: publisher.foundedYear || undefined,
          isActive: publisher.isActive ?? true,
        }
      : {
          name: '',
          slug: '',
          description: '',
          website: '',
          logoPublicId: '',
          logoUrl: '',
          country: '',
          foundedYear: undefined,
          isActive: true,
        },
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: string,
  ) => {
    const target = e.target as any
    const value =
      target.type === 'checkbox'
        ? target.checked
        : fieldName === 'foundedYear' && target.value
          ? parseInt(target.value, 10)
          : fieldName === 'foundedYear'
            ? undefined
            : target.value
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    const validation = publisherSchema.safeParse(formData)
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
      const logoProvided = data.logoPublicId || data.logoUrl

      if (logoProvided && !(data.logoPublicId && data.logoUrl)) {
        toast.error('Logo requires both a public ID and a URL.')
        return
      }

      const payload = {
        name: data.name,
        slug: data.slug.trim().toLowerCase(),
        description: data.description || undefined,
        website: data.website || undefined,
        logo:
          data.logoPublicId && data.logoUrl
            ? {
                publicId: data.logoPublicId.trim(),
                url: data.logoUrl.trim(),
              }
            : undefined,
        country: data.country || undefined,
        foundedYear: data.foundedYear || undefined,
        isActive: data.isActive,
      }

      if (publisher?._id) {
        await updatePublisher({
          id: publisher._id,
          body: payload,
        }).unwrap()
      } else {
        await createPublisher(payload).unwrap()
      }

      toast.success(
        publisher
          ? t('common.updatedSuccessfully')
          : t('common.createdSuccessfully'),
      )
      setFormData({
        name: '',
        slug: '',
        description: '',
        website: '',
        logoPublicId: '',
        logoUrl: '',
        country: '',
        foundedYear: undefined,
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">
            {publisher
              ? t('publishers.editPublisher')
              : t('publishers.addPublisher')}
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
              {t('publishers.name')}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleFieldChange(e, 'name')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.name)}
              placeholder="Publisher name (2-200 characters)"
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <Label className="mb-2 block">
              Slug
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.slug}
              onChange={(e) => handleFieldChange(e, 'slug')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.slug)}
              placeholder="publisher-slug"
            />
            <FieldError message={fieldErrors.slug} />
          </div>

          <div>
            <Label className="mb-2 block">{t('publishers.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleFieldChange(e, 'description')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.description)}
              rows={3}
              placeholder="Publisher description (3-2000 characters)"
            />
            <FieldError message={fieldErrors.description} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleFieldChange(e, 'country')}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.country)}
                placeholder="Bangladesh"
              />
              <FieldError message={fieldErrors.country} />
            </div>

            <div>
              <Label className="mb-2 block">Founded Year</Label>
              <Input
                type="number"
                value={formData.foundedYear || ''}
                onChange={(e) => handleFieldChange(e, 'foundedYear')}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.foundedYear)}
                placeholder="2020"
              />
              <FieldError message={fieldErrors.foundedYear} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Website</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => handleFieldChange(e, 'website')}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.website)}
              placeholder="https://publisherwebsite.com"
            />
            <FieldError message={fieldErrors.website} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">Logo Public ID</Label>
              <Input
                value={formData.logoPublicId}
                onChange={(e) => handleFieldChange(e, 'logoPublicId')}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.logoPublicId)}
                placeholder="publishers/logo-public-id"
              />
              <FieldError message={fieldErrors.logoPublicId} />
            </div>

            <div>
              <Label className="mb-2 block">Logo URL</Label>
              <Input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => handleFieldChange(e, 'logoUrl')}
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.logoUrl)}
                placeholder="https://example.com/logo.png"
              />
              <FieldError message={fieldErrors.logoUrl} />
            </div>
          </div>

          <div>
            <Label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => handleFieldChange(e as any, 'isActive')}
                disabled={isLoading}
              />
              <span className="text-sm font-medium">Active</span>
            </Label>
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
