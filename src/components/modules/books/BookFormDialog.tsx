'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FieldError } from '@/components/common/FieldError'
import { MultiSelect } from '@/components/common/MultiSelect'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGetAuthorsQuery } from '@/store/api/authorsApi'
import {
  Book,
  BookFile,
  useCreateBookMutation,
  useDeleteBookFileMutation,
  useUpdateBookMutation,
  useUploadBookFileMutation,
} from '@/store/api/booksApi'
import { useGetCategoriesQuery } from '@/store/api/categoriesApi'
import { useGetPublishersQuery } from '@/store/api/publishersApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const commaIndex = result.indexOf(',')
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
      } else {
        reject(new Error('Unable to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Match backend validation exactly - professional schema with detailed feedback
const bookSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters (currently {0} chars)')
    .max(200, 'Title must not exceed 200 characters (currently {0} chars)'),
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
  summary: z
    .string()
    .trim()
    .min(10, 'Summary must be at least 10 characters')
    .max(2000, 'Summary must not exceed 2000 characters')
    .refine(
      (val) => val.split(/\s+/).length >= 3,
      'Summary must contain at least 3 words',
    ),
  isbn: z
    .string()
    .trim()
    .min(8, 'ISBN must be at least 8 characters')
    .max(40, 'ISBN must not exceed 40 characters')
    .optional()
    .or(z.literal('')),
  publisherId: z.string().optional().or(z.literal('')),
  authorIds: z
    .array(z.string())
    .min(1, 'Select at least one author')
    .max(20, 'Maximum 20 authors allowed'),
  categoryIds: z
    .array(z.string())
    .min(1, 'Select at least one category')
    .max(20, 'Maximum 20 categories allowed'),
  language: z
    .string()
    .trim()
    .min(2, 'Language code must be at least 2 characters')
    .max(20, 'Language code must not exceed 20 characters'),
  publicationDate: z.string().optional().or(z.literal('')),
  pageCount: z
    .number()
    .int('Page count must be an integer')
    .min(1, 'Page count must be at least 1')
    .max(100000, 'Page count must not exceed 100000')
    .optional(),
  coverImagePublicId: z
    .string()
    .trim()
    .max(300, 'Cover image public ID must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
  coverImageUrl: z
    .string()
    .trim()
    .url('Invalid cover image URL')
    .max(800)
    .optional()
    .or(z.literal('')),
  coverImageWidth: z
    .number()
    .int('Cover image width must be an integer')
    .min(1, 'Cover image width must be at least 1')
    .optional(),
  coverImageHeight: z
    .number()
    .int('Cover image height must be an integer')
    .min(1, 'Cover image height must be at least 1')
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must not exceed 10000 characters')
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.split(/\s+/).length >= 3,
      'Description must contain at least 3 words if provided',
    ),
  edition: z
    .string()
    .trim()
    .min(1, 'Edition must be at least 1 character')
    .max(50, 'Edition must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  featured: z.boolean(),
  isAvailable: z.boolean(),
  accessLevel: z.enum(['free', 'basic', 'premium']),
  isPublished: z.boolean(),
})

type BookFormData = z.input<typeof bookSchema>
type BookFormValues = z.output<typeof bookSchema>

interface BookFormDialogProps {
  book?: Book | null
  onClose: () => void
}

export function BookFormDialog({ book, onClose }: BookFormDialogProps) {
  const t = useTranslations()
  const [createBook] = useCreateBookMutation()
  const [updateBook] = useUpdateBookMutation()
  const [uploadBookFile] = useUploadBookFileMutation()
  const [deleteBookFile] = useDeleteBookFileMutation()
  const { data: authorsData } = useGetAuthorsQuery({})
  const { data: categoriesData } = useGetCategoriesQuery({})
  const { data: publishersData } = useGetPublishersQuery({
    page: 1,
    limit: 100,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [deletingFile, setDeletingFile] = useState<BookFile | null>(null)
  const existingFiles = useMemo(() => book?.files || [], [book?.files])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BookFormData, undefined, BookFormValues>({
    resolver: zodResolver(bookSchema),
    mode: 'onBlur',
    defaultValues: book
      ? {
          title: book.title,
          slug: book.slug,
          summary: book.summary,
          isbn: book.isbn || '',
          authorIds: book.authorIds || [],
          categoryIds: book.categoryIds || [],
          publisherId: book.publisherId || '',
          language: book.language || 'en',
          publicationDate: book.publicationDate?.split('T')[0],
          pageCount: book.pageCount,
          coverImagePublicId: book.coverImage?.publicId || '',
          coverImageUrl: book.coverImage?.url || '',
          coverImageWidth: book.coverImage?.width,
          coverImageHeight: book.coverImage?.height,
          description: book.description || '',
          edition: book.edition || '',
          tags: book.tags?.join(', '),
          featured: book.featured ?? false,
          isAvailable: book.isAvailable ?? true,
          accessLevel: book.accessLevel || 'free',
          isPublished: book.isPublished ?? false,
        }
      : {
          title: '',
          slug: '',
          summary: '',
          isbn: '',
          authorIds: [],
          categoryIds: [],
          publisherId: '',
          language: 'en',
          publicationDate: '',
          pageCount: undefined,
          coverImagePublicId: '',
          coverImageUrl: '',
          coverImageWidth: undefined,
          coverImageHeight: undefined,
          description: '',
          edition: '',
          tags: '',
          featured: false,
          isAvailable: true,
          accessLevel: 'free',
          isPublished: false,
        },
  })

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true)
    try {
      const coverImageProvided =
        data.coverImagePublicId ||
        data.coverImageUrl ||
        data.coverImageWidth ||
        data.coverImageHeight

      if (coverImageProvided) {
        const hasCompleteCoverImage =
          data.coverImagePublicId &&
          data.coverImageUrl &&
          data.coverImageWidth &&
          data.coverImageHeight

        if (!hasCompleteCoverImage) {
          toast.error('Cover image requires public ID, URL, width, and height.')
          return
        }
      }

      const payload = {
        title: data.title.trim(),
        slug: slugify(data.slug),
        summary: data.summary.trim(),
        isbn: data.isbn ? data.isbn.trim() : undefined,
        authorIds: data.authorIds,
        categoryIds: data.categoryIds,
        publisherId: data.publisherId || undefined,
        language: data.language.trim(),
        publicationDate: data.publicationDate || undefined,
        pageCount: data.pageCount || undefined,
        coverImage: coverImageProvided
          ? {
              publicId: data.coverImagePublicId!.trim(),
              url: data.coverImageUrl!.trim(),
              width: Number(data.coverImageWidth),
              height: Number(data.coverImageHeight),
            }
          : undefined,
        description: data.description ? data.description.trim() : undefined,
        edition: data.edition ? data.edition.trim() : undefined,
        featured: Boolean(data.featured),
        isAvailable: Boolean(data.isAvailable),
        accessLevel: data.accessLevel || 'free',
        isPublished: Boolean(data.isPublished),
        tags: data.tags
          ? data.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0 && tag.length <= 50)
          : [],
      }

      // Validate payload before sending
      if (payload.tags && payload.tags.length > 40) {
        toast.error('Maximum 40 tags allowed')
        setIsLoading(false)
        return
      }

      let result
      if (book?._id) {
        result = await updateBook({
          id: book._id,
          body: payload,
        }).unwrap()
        toast.success(`Book "${result.title}" updated successfully`)
      } else {
        result = await createBook(payload).unwrap()
        toast.success(`Book "${result.title}" created successfully`)
      }

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileBase64 = await fileToBase64(file)
          await uploadBookFile({
            id: result._id || result.id || '',
            body: {
              fileName: file.name,
              contentType: file.type || 'application/octet-stream',
              fileBase64,
              folder: `books/${result._id || result.id || ''}`,
              resourceType: 'raw',
            },
          }).unwrap()
        }
      }

      reset()
      setSelectedFiles([])
      onClose()
    } catch (error) {
      let errorMessage = t('errors.serverError')

      if (error instanceof Error) {
        if (
          error.message.includes('duplicate key') ||
          error.message.includes('slug')
        ) {
          errorMessage =
            'This slug already exists. Please choose a different slug.'
        } else if (error.message.includes('ISBN')) {
          errorMessage = 'This ISBN already exists. Please enter a unique ISBN.'
        } else if (error.message.length > 0) {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
      console.error('Book form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async () => {
    if (!book?._id) {
      return
    }

    if (!deletingFile) {
      return
    }

    try {
      await deleteBookFile({ id: book._id, fileId: deletingFile.id }).unwrap()
      toast.success(`Removed "${deletingFile.originalFileName}"`)
      setDeletingFile(null)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to remove book file. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border shadow-lg max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold">
            {book ? t('books.editBook') : t('books.addBook')}
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
              {t('common.title')}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('title')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.title)}
              placeholder="Book title (2-200 characters)"
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label className="mb-2 block">
              Slug
              <span className="text-red-500">*</span>
            </Label>
            <Input
              {...register('slug')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.slug)}
              placeholder="book-title-slug"
            />
            <FieldError message={errors.slug?.message} />
          </div>

          <div>
            <Label className="mb-2 block">
              Summary
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              {...register('summary')}
              disabled={isLoading}
              aria-invalid={Boolean(errors.summary)}
              rows={3}
              placeholder="Book summary (10-2000 characters)"
            />
            <FieldError message={errors.summary?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">
                {t('books.isbn')}{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                {...register('isbn')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.isbn)}
                placeholder="ISBN (8-40 chars)"
              />
              <FieldError message={errors.isbn?.message} />
            </div>
            <div>
              <Label className="mb-2 block">
                Edition{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                {...register('edition')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.edition)}
                placeholder="First Edition"
              />
              <FieldError message={errors.edition?.message} />
            </div>
          </div>

          {/* Authors & Categories */}
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
              <Label className="mb-2 block">Language</Label>
              <Select
                {...register('language')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.language)}
              >
                <option value="en">English</option>
                <option value="bn">Bangla</option>
              </Select>
              <FieldError message={errors.language?.message} />
            </div>
            <div>
              <Label className="mb-2 block">
                Publication Date{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                type="date"
                {...register('publicationDate')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.publicationDate)}
              />
              <FieldError message={errors.publicationDate?.message} />
            </div>
          </div>

          {/* Page Count, Publisher & Cover Image */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('books.pageCount')}
              </label>
              <input
                type="number"
                {...register('pageCount', { valueAsNumber: true })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.pageCount
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="Pages"
              />
              {errors.pageCount && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.pageCount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Publisher
              </label>
              <Select
                {...register('publisherId')}
                disabled={isLoading}
                aria-invalid={Boolean(errors.publisherId)}
              >
                <option value="">No publisher</option>
                {publishersData?.data?.map((publisher) => (
                  <option key={publisher._id} value={publisher._id}>
                    {publisher.name}
                  </option>
                ))}
              </Select>
              {errors.publisherId && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.publisherId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image Public ID
              </label>
              <input
                type="text"
                {...register('coverImagePublicId')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.coverImagePublicId
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="books/cover-image-public-id"
              />
              {errors.coverImagePublicId && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.coverImagePublicId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                {...register('coverImageUrl')}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.coverImageUrl
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="https://..."
              />
              {errors.coverImageUrl && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.coverImageUrl.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image Width
              </label>
              <input
                type="number"
                {...register('coverImageWidth', { valueAsNumber: true })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.coverImageWidth
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="Width in pixels"
              />
              {errors.coverImageWidth && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.coverImageWidth.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cover Image Height
              </label>
              <input
                type="number"
                {...register('coverImageHeight', { valueAsNumber: true })}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                  errors.coverImageHeight
                    ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-1 focus:ring-primary'
                } focus:outline-none disabled:opacity-50`}
                placeholder="Height in pixels"
              />
              {errors.coverImageHeight && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.coverImageHeight.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('common.description')}
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
              placeholder="Detailed description (10-10000 characters)"
            />
            {errors.description && (
              <p className="text-red-600 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              {...register('tags')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.tags
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
              placeholder="fiction, mystery, kids (comma separated)"
            />
            {errors.tags && (
              <p className="text-red-600 text-xs mt-1">{errors.tags.message}</p>
            )}
          </div>

          {/* Access Level */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Access Level
            </label>
            <select
              {...register('accessLevel')}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg bg-background transition ${
                errors.accessLevel
                  ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-1 focus:ring-primary'
              } focus:outline-none disabled:opacity-50`}
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            {errors.accessLevel && (
              <p className="text-red-600 text-xs mt-1">
                {errors.accessLevel.message}
              </p>
            )}
          </div>

          {/* Book Files */}
          <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="block text-sm font-medium">Book Files</label>
                <p className="text-xs text-muted-foreground">
                  Upload PDF, EPUB, or MOBI files after saving the book.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedFiles.length} queued
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                <Upload className="size-4" />
                Select files
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || [])
                    setSelectedFiles(files)
                  }}
                />
              </label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="self-start rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  Clear selection
                </button>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {selectedFiles.map((file) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {existingFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Uploaded files
                </p>
                <div className="space-y-2">
                  {existingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {file.originalFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.format.toUpperCase()} ·{' '}
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setDeletingFile(file)}
                        disabled={isLoading}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox {...register('featured')} disabled={isLoading} />
              <span>{t('books.featured')}</span>
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox {...register('isAvailable')} disabled={isLoading} />
              <span>{t('books.available')}</span>
            </Label>
            <Label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox {...register('isPublished')} disabled={isLoading} />
              <span>Published</span>
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

      {deletingFile && (
        <ConfirmDialog
          title="Delete file"
          description={`Delete "${deletingFile.originalFileName}" from this book?`}
          isDangerous
          isLoading={isLoading}
          onCancel={() => setDeletingFile(null)}
          onConfirm={handleDeleteFile}
        />
      )}
    </div>
  )
}
