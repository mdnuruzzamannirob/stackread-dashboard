'use client'

import { MultiSelect } from '@/components/common/MultiSelect'
import { useGetAuthorsQuery } from '@/store/api/authorsApi'
import {
  Book,
  useCreateBookMutation,
  useUpdateBookMutation,
} from '@/store/api/booksApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const bookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title must not exceed 255 characters'),
  isbn: z
    .string()
    .min(1, 'ISBN is required')
    .min(10, 'ISBN must be at least 10 characters')
    .max(20, 'ISBN must not exceed 20 characters'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  category: z.string().min(1, 'Category is required'),
  publisher: z
    .string()
    .max(255, 'Publisher must not exceed 255 characters')
    .optional(),
  publishedYear: z
    .number()
    .min(1000, 'Year must be valid')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .or(z.literal(0)),
  pageCount: z
    .number()
    .min(1, 'Page count must be at least 1')
    .optional()
    .or(z.literal(0)),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
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
          isbn: book.isbn,
          authors: book.authors || [],
          category: book.category,
          publisher: book.publisher,
          publishedYear: book.publishedYear,
          pageCount: book.pageCount,
          description: book.description,
        }
      : {
          authors: [],
        },
  })

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)
    try {
      if (book?._id) {
        await updateBook({
          id: book._id,
          body: data,
        }).unwrap()
      } else {
        await createBook(data).unwrap()
      }
      reset()
      onClose()
    } catch (error) {
      console.error('Error saving book:', error)
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
              name="authors"
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
                  error={errors.authors?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('books.category')}
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value="">Select category</option>
              {categoriesData?.data.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('books.publisher')}
            </label>
            <input
              type="text"
              {...register('publisher')}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              placeholder="Publisher"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('books.publishedYear')}
              </label>
              <input
                type="number"
                {...register('publishedYear', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Year"
              />
            </div>
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
