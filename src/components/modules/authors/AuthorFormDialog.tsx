'use client'

import { FieldError } from '@/components/common/FieldError'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
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
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div>
            <Label className="mb-2 block">
              {t('authors.name')}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('name')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.name)}
              placeholder="Enter author name (2-150 characters)"
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label className="mb-2 block">{t('authors.bio')}</Label>
            <Textarea
              {...register('bio')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.bio)}
              rows={4}
              placeholder="Author biography (3-3000 characters)"
            />
            <FieldError message={errors.bio?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Country</Label>
              <Input
                {...register('countryCode')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.countryCode)}
                placeholder="BD or USA"
              />
              <FieldError message={errors.countryCode?.message} />
            </div>

            <div>
              <Label className="mb-2 block">Status</Label>
              <Label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox {...register('isActive')} disabled={isLoading} />
                <span>Active</span>
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">Avatar Public ID</Label>
              <Input
                {...register('avatarPublicId')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.avatarPublicId)}
                placeholder="authors/avatar-public-id"
              />
              <FieldError message={errors.avatarPublicId?.message} />
            </div>

            <div>
              <Label className="mb-2 block">Avatar URL</Label>
              <Input
                type="url"
                {...register('avatarUrl')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.avatarUrl)}
                placeholder="https://example.com/avatar.png"
              />
              <FieldError message={errors.avatarUrl?.message} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Website</Label>
            <Input
              type="url"
              {...register('website')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.website)}
              placeholder="https://authorwebsite.com"
            />
            <FieldError message={errors.website?.message} />
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
