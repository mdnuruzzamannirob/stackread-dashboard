'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  useDeleteAuthorMutation,
  useGetAuthorByIdQuery,
} from '@/store/api/authorsApi'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AuthorDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const authorId = params?.id || ''
  const {
    data: author,
    isLoading,
    isError,
  } = useGetAuthorByIdQuery(authorId, {
    skip: !authorId,
  })
  const [deleteAuthor] = useDeleteAuthorMutation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !author) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/authors')}>
          <ChevronLeft className="size-4" />
          Back to authors
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load author details.
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteAuthor(author._id).unwrap()
      toast.success('Author deleted successfully')
      router.push('/authors')
    } catch {
      toast.error('Failed to delete author')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.push('/authors')}>
          <ChevronLeft className="size-4" />
          Back to authors
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h1 className="text-2xl font-bold">{author.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {author.bio || 'No bio provided.'}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Country</p>
            <p className="mt-1">{author.countryCode || '—'}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Website</p>
            <p className="mt-1">{author.website || '—'}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Status</p>
            <p className="mt-1">{author.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
