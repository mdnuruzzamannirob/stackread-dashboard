'use client'

import {
  Publisher,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
} from '@/store/api/publishersApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PublisherFormData, undefined, PublisherFormValues>({
    resolver: zodResolver(publisherSchema),
    mode: 'onBlur',
    defaultValues: publisher
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
  })

  const onSubmit = async (data: PublisherFormData) => {
    setIsLoading(true)
    try {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('publishers.name')}
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
              placeholder="Publisher name (2-200 characters)"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Slug
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('slug')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.slug
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              placeholder="publisher-slug"
            />
            {errors.slug && (
              <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('publishers.description')}
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
              placeholder="Publisher description (3-2000 characters)"
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                {...register('country')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.country
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="Bangladesh"
              />
              {errors.country && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Founded Year
              </label>
              <input
                type="number"
                {...register('foundedYear', { valueAsNumber: true })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.foundedYear
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="2020"
              />
              {errors.foundedYear && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.foundedYear.message}
                </p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              {...register('website')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.website
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              placeholder="https://publisherwebsite.com"
            />
            {errors.website && (
              <p className="text-red-600 text-xs mt-1">
                {errors.website.message}
              </p>
            )}
          </div>

          {/* Logo */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Logo Public ID
              </label>
              <input
                type="text"
                {...register('logoPublicId')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.logoPublicId
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="publishers/logo-public-id"
              />
              {errors.logoPublicId && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.logoPublicId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="url"
                {...register('logoUrl')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.logoUrl
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="https://example.com/logo.png"
              />
              {errors.logoUrl && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Active */}
          <div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                disabled={isLoading}
                className="rounded border-border cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
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
