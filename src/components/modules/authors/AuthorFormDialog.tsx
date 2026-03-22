'use client'

import {
  Author,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
} from '@/store/api/authorsApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const authorSchema = z.object({
  name: z.string().min(2, 'Name is required').max(150),
  bio: z.string().max(3000).optional(),
  countryCode: z
    .string()
    .min(2)
    .max(3)
    .regex(/^[A-Za-z]{2,3}$/)
    .optional()
    .or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
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
    defaultValues: author
      ? {
          name: author.name,
          bio: author.bio,
          countryCode: author.countryCode || '',
          avatarUrl: author.avatarUrl || '',
          website: author.website || '',
          isActive: author.isActive,
        }
      : {
          name: '',
          bio: '',
          countryCode: '',
          avatarUrl: '',
          website: '',
          isActive: true,
        },
  })

  const onSubmit = async (data: AuthorFormData) => {
    setIsLoading(true)
    try {
      if (author?._id) {
        await updateAuthor({
          id: author._id,
          body: {
            ...data,
            countryCode: data.countryCode || undefined,
            avatarUrl: data.avatarUrl || undefined,
            website: data.website || undefined,
          },
        }).unwrap()
      } else {
        await createAuthor({
          ...data,
          countryCode: data.countryCode || undefined,
          avatarUrl: data.avatarUrl || undefined,
          website: data.website || undefined,
        }).unwrap()
      }
      toast.success(t('common.success'))
      reset()
      onClose()
    } catch {
      toast.error(t('errors.serverError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {author ? t('authors.editAuthor') : t('authors.addAuthor')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('authors.name')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Author name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('authors.bio')}
            </label>
            <textarea
              {...register('bio')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
              rows={4}
              placeholder="Author biography"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                {...register('countryCode')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="BD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <label className="mt-2 inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded border-border"
                />
                Yes
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              type="url"
              {...register('avatarUrl')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="https://..."
            />
            {errors.avatarUrl && (
              <p className="text-red-600 text-xs mt-1">
                {errors.avatarUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              type="url"
              {...register('website')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="https://..."
            />
            {errors.website && (
              <p className="text-red-600 text-xs mt-1">{errors.website.message}</p>
            )}
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
