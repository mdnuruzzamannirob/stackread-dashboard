'use client'

import {
  Publisher,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
} from '@/store/api/publishersApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const publisherSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  description: z.string().max(3000).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  foundedYear: z
    .number()
    .int()
    .min(1450)
    .max(new Date().getFullYear())
    .optional(),
  isActive: z.boolean(),
})

type PublisherFormData = z.infer<typeof publisherSchema>

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
  } = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: publisher
      ? {
          name: publisher.name,
          description: publisher.description || '',
          website: publisher.website || '',
          logoUrl: publisher.logoUrl || '',
          country: publisher.country || '',
          foundedYear: publisher.foundedYear || undefined,
          isActive: publisher.isActive,
        }
      : {
          name: '',
          description: '',
          website: '',
          logoUrl: '',
          country: '',
          foundedYear: undefined,
          isActive: true,
        },
  })

  const onSubmit = async (data: PublisherFormData) => {
    setIsLoading(true)
    try {
      if (publisher?._id) {
        await updatePublisher({
          id: publisher._id,
          body: {
            ...data,
            description: data.description || undefined,
            website: data.website || undefined,
            logoUrl: data.logoUrl || undefined,
            country: data.country || undefined,
            foundedYear: data.foundedYear,
          },
        }).unwrap()
      } else {
        await createPublisher({
          ...data,
          description: data.description || undefined,
          website: data.website || undefined,
          logoUrl: data.logoUrl || undefined,
          country: data.country || undefined,
          foundedYear: data.foundedYear,
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
            {publisher
              ? t('publishers.editPublisher')
              : t('publishers.addPublisher')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('publishers.name')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Publisher name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('publishers.description')}
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
              rows={4}
              placeholder="Publisher description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                {...register('country')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Bangladesh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Founded</label>
              <input
                type="number"
                {...register('foundedYear', {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="2020"
              />
            </div>
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
              <p className="text-red-600 text-xs mt-1">
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logo URL</label>
            <input
              type="url"
              {...register('logoUrl')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="https://..."
            />
            {errors.logoUrl && (
              <p className="text-red-600 text-xs mt-1">
                {errors.logoUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-border"
              />
              {t('publishers.active')}
            </label>
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
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
