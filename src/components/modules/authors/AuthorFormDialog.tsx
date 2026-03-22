'use client'

import {
  Author,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
} from '@/store/api/authorsApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Match backend validation exactly
const authorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must not exceed 150 characters'),
  bio: z
    .string()
    .trim()
    .min(3, 'Bio must be at least 3 characters')
    .max(3000, 'Bio must not exceed 3000 characters')
    .optional()
    .or(z.literal('')),
  countryCode: z
    .string()
    .trim()
    .min(2, 'Country code must be 2-3 characters')
    .max(3, 'Country code must be 2-3 characters')
    .toUpperCase()
    .optional()
    .or(z.literal('')),
  avatarPublicId: z
    .string()
    .trim()
    .max(300, 'Avatar public ID must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .max(800, 'URL must not exceed 800 characters')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .max(500, 'URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
})

type AuthorFormData = z.infer<typeof authorSchema>

interface AuthorFormDialogProps {
  author?: Author | null
  onClose: () => void
}

export function AuthorFormDialog({ author, onClose }: AuthorFormDialogProps) {
  const t = useTranslations()
  const [createAuthor] = useCreateAuthorMutation()
  const [updateAuthor] = useUpdateAuthorMutation()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    mode: 'onBlur',
    defaultValues: author
      ? {
          name: author.name,
          bio: author.bio || '',
          countryCode: author.countryCode || '',
          avatarPublicId: author.avatar?.publicId || '',
          avatarUrl: author.avatar?.url || '',
          website: author.website || '',
          isActive: author.isActive ?? true,
        }
      : {
          name: '',
          bio: '',
          countryCode: '',
          avatarPublicId: '',
          avatarUrl: '',
          website: '',
          isActive: true,
        },
  })

  const onSubmit = async (data: AuthorFormData) => {
    setIsLoading(true)
    try {
      const avatarProvided = data.avatarPublicId || data.avatarUrl

      if (avatarProvided && !(data.avatarPublicId && data.avatarUrl)) {
        toast.error('Avatar requires both a public ID and a URL.')
        return
      }

      const payload = {
        name: data.name,
        bio: data.bio || undefined,
        countryCode: data.countryCode || undefined,
        avatar:
          data.avatarPublicId && data.avatarUrl
            ? {
                publicId: data.avatarPublicId.trim(),
                url: data.avatarUrl.trim(),
              }
            : undefined,
        website: data.website || undefined,
        isActive: data.isActive,
      }

      if (author?._id) {
        await updateAuthor({
          id: author._id,
          body: payload,
        }).unwrap()
      } else {
        await createAuthor(payload).unwrap()
      }

      toast.success(
        author
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
            {author ? t('authors.editAuthor') : t('authors.addAuthor')}
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
              {t('authors.name')}
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
              placeholder="Enter author name (2-150 characters)"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('authors.bio')}
            </label>
            <textarea
              {...register('bio')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background resize-none transition ${
                errors.bio
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              rows={4}
              placeholder="Author biography (3-3000 characters)"
            />
            {errors.bio && (
              <p className="text-red-600 text-xs mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country Code */}
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                {...register('countryCode')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.countryCode
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="BD or USA"
              />
              {errors.countryCode && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.countryCode.message}
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

          {/* Avatar */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Avatar Public ID
              </label>
              <input
                type="text"
                {...register('avatarPublicId')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.avatarPublicId
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="authors/avatar-public-id"
              />
              {errors.avatarPublicId && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.avatarPublicId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                {...register('avatarUrl')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.avatarUrl
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="https://example.com/avatar.png"
              />
              {errors.avatarUrl && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.avatarUrl.message}
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
              placeholder="https://authorwebsite.com"
            />
            {errors.website && (
              <p className="text-red-600 text-xs mt-1">
                {errors.website.message}
              </p>
            )}
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
