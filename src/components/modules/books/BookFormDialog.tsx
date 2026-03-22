'use client'

import { MultiSelect } from '@/components/common/MultiSelect'
import { useGetAuthorsQuery } from '@/store/api/authorsApi'
import {
  Book,
  useCreateBookMutation,
  useUpdateBookMutation,
  useUploadBookFileMutation,
} from '@/store/api/booksApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase and hyphenated',
    ),
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(2000, 'Summary must not exceed 2000 characters'),
  isbn: z
    .string()
    .min(8, 'ISBN must be at least 8 characters')
    .max(20, 'ISBN must not exceed 20 characters'),
  authorIds: z.array(z.string()).min(1, 'At least one author is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  language: z.string().min(2).max(20),
  publicationDate: z.string().optional(),
  pageCount: z.number().min(1, 'Page count must be at least 1').optional(),
  coverImageUrl: z
    .string()
    .url('Invalid cover image URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  tags: z.string().optional(),
  featured: z.boolean(),
  isAvailable: z.boolean(),
  ebookUrl: z.string().url('Invalid ebook URL').optional().or(z.literal('')),
  ebookFormat: z.string().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

interface BookFormDialogProps {
  book?: Book | null
  onClose: () => void
}

export function BookFormDialog({ book, onClose }: BookFormDialogProps) {
  const t = useTranslations()
  const [createBook] = useCreateBookMutation()
  const [updateBook] = useUpdateBookMutation()
  const [uploadBookFile] = useUploadBookFileMutation()
  const { data: authorsData } = useGetAuthorsQuery({})
  const { data: categoriesData } = useGetCategoriesQuery({})
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          title: book.title,
          slug: book.slug,
          summary: book.summary,
          isbn: book.isbn,
          authorIds: book.authorIds || [],
          categoryIds: book.categoryIds || [],
          language: book.language || 'en',
          publicationDate: book.publicationDate?.split('T')[0],
          pageCount: book.pageCount,
          coverImageUrl: book.coverImageUrl || '',
          description: book.description || '',
          tags: book.tags?.join(', '),
          featured: book.featured,
          isAvailable: book.isAvailable,
          ebookFormat: book.files?.[0]?.contentType || 'application/pdf',
          ebookUrl: book.files?.[0]?.url || '',
        }
      : {
          title: '',
          slug: '',
          summary: '',
          isbn: '',
          authorIds: [],
          categoryIds: [],
          language: 'en',
          publicationDate: '',
          coverImageUrl: '',
          description: '',
          tags: '',
          featured: false,
          isAvailable: true,
          ebookFormat: 'application/pdf',
          ebookUrl: '',
        },
  })

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        isbn: data.isbn,
        authorIds: data.authorIds,
        categoryIds: data.categoryIds,
        language: data.language,
        publicationDate: data.publicationDate || undefined,
        pageCount: data.pageCount || undefined,
        coverImageUrl: data.coverImageUrl || undefined,
        description: data.description,
        featured: data.featured,
        isAvailable: data.isAvailable,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      }

      let savedBookId = book?._id

      if (book?._id) {
        const updated = await updateBook({
          id: book._id,
          body: payload,
        }).unwrap()
        savedBookId = updated._id
      } else {
        const created = await createBook(payload).unwrap()
        savedBookId = created._id
      }

      if (savedBookId && data.ebookUrl && data.ebookFormat) {
        await uploadBookFile({
          id: savedBookId,
          body: {
            fileName: `${data.slug}.${data.ebookFormat.includes('epub') ? 'epub' : 'pdf'}`,
            contentType: data.ebookFormat,
            url: data.ebookUrl,
            key: data.ebookUrl,
          },
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
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">
            {book ? t('books.editBook') : t('books.addBook')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common.title')}
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Book title"
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              {...register('slug')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="book-title-slug"
            />
            {errors.slug && (
              <p className="text-red-600 text-xs mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea
              {...register('summary')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
              rows={3}
              placeholder="Short summary of this book"
            />
            {errors.summary && (
              <p className="text-red-600 text-xs mt-1">
                {errors.summary.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('books.isbn')}
            </label>
            <input
              type="text"
              {...register('isbn')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="ISBN"
            />
            {errors.isbn && (
              <p className="text-red-600 text-xs mt-1">{errors.isbn.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="authorIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label={t('books.authors')}
                  options={
                    authorsData?.data?.map((author) => ({
                      id: author._id,
                      name: author.name,
                    })) || []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select authors..."
                  error={errors.authorIds?.message}
                />
              )}
            />
          </div>

          <div>
            <Controller
              name="categoryIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label={t('books.category')}
                  options={
                    categoriesData?.data?.map((category) => ({
                      id: category._id,
                      name: category.name,
                    })) || []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select categories..."
                  error={errors.categoryIds?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Publication Date
              </label>
              <input
                type="date"
                {...register('publicationDate')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('books.pageCount')}
              </label>
              <input
                type="number"
                {...register('pageCount', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Pages"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                {...register('coverImageUrl')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                E-book URL
              </label>
              <input
                type="url"
                {...register('ebookUrl')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="https://.../book.pdf"
              />
              {errors.ebookUrl && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.ebookUrl.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                E-book Format
              </label>
              <select
                {...register('ebookFormat')}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              >
                <option value="application/pdf">PDF</option>
                <option value="application/epub+zip">EPUB</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common.description')}
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
              rows={3}
              placeholder="Book description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              {...register('tags')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="fiction, mystery, kids"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('featured')}
                className="rounded border-border"
              />
              {t('books.featured')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('isAvailable')}
                className="rounded border-border"
              />
              {t('books.available')}
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
