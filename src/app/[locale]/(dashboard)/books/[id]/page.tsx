'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import {
  useDeleteBookMutation,
  useGetBookByIdQuery,
  useToggleBookAvailableMutation,
  useToggleBookFeaturedMutation,
  useUpdateBookStatusMutation,
} from '@/store/api/booksApi'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { ChevronLeft, Pencil, RefreshCw } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

const formatDate = (value?: string): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US')
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const bookId = params?.id

  const {
    data: book,
    isLoading,
    isError,
    refetch,
  } = useGetBookByIdQuery(bookId || '', { skip: !bookId })
  const [toggleFeatured] = useToggleBookFeaturedMutation()
  const [toggleAvailable] = useToggleBookAvailableMutation()
  const [updateStatus] = useUpdateBookStatusMutation()
  const [deleteBook] = useDeleteBookMutation()

  const files = useMemo(() => book?.files ?? [], [book?.files])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !book) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/books')}>
          <ChevronLeft className="size-4" />
          Back to books
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load book details.
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteBook(book._id).unwrap()
      toast.success('Book deleted successfully')
      router.push('/books')
    } catch {
      toast.error('Failed to delete book')
    }
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BOOKS_MANAGE}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/books')}>
            <ChevronLeft className="size-4" />
            Back to books
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/books/${book._id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Book
              </p>
              <h1 className="mt-2 text-2xl font-bold">{book.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {book.summary}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium">{book.status}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  Availability
                </p>
                <p className="mt-1 text-sm font-medium">
                  {book.availabilityStatus}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  Featured
                </p>
                <p className="mt-1 text-sm font-medium">
                  {book.featured ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">
                  Access
                </p>
                <p className="mt-1 text-sm font-medium">{book.accessLevel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await toggleFeatured({
                      id: book._id,
                      featured: !book.featured,
                    }).unwrap()
                    toast.success('Featured state updated')
                  } catch {
                    toast.error('Failed to update featured state')
                  }
                }}
              >
                Toggle Featured
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await toggleAvailable({
                      id: book._id,
                      available: !book.isAvailable,
                    }).unwrap()
                    toast.success('Availability updated')
                  } catch {
                    toast.error('Failed to update availability')
                  }
                }}
              >
                Toggle Availability
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await updateStatus({
                      id: book._id,
                      status:
                        book.status === 'published' ? 'archived' : 'published',
                    }).unwrap()
                    toast.success('Status updated')
                  } catch {
                    toast.error('Failed to update status')
                  }
                }}
              >
                Toggle Status
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </article>

          <aside className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Metadata
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Slug:</span> {book.slug}
                </p>
                <p>
                  <span className="font-medium">ISBN:</span> {book.isbn || '—'}
                </p>
                <p>
                  <span className="font-medium">Language:</span> {book.language}
                </p>
                <p>
                  <span className="font-medium">Pages:</span>{' '}
                  {book.pageCount || '—'}
                </p>
                <p>
                  <span className="font-medium">Published:</span>{' '}
                  {formatDate(book.publicationDate)}
                </p>
                <p>
                  <span className="font-medium">Updated:</span>{' '}
                  {formatDate(book.updatedAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Files
              </p>
              <div className="mt-3 space-y-2 text-sm">
                {files.length === 0 ? (
                  <p className="text-muted-foreground">No files uploaded</p>
                ) : (
                  files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-border px-3 py-2 hover:bg-muted"
                    >
                      {file.originalFileName} ({file.format.toUpperCase()})
                    </a>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PermissionGuard>
  )
}
