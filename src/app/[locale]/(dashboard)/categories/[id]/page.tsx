'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import {
  useDeleteCategoryMutation,
  useGetCategoryByIdQuery,
} from '@/store/api/categoriesApi'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const categoryId = params?.id || ''
  const {
    data: category,
    isLoading,
    isError,
  } = useGetCategoryByIdQuery(categoryId, { skip: !categoryId })
  const [deleteCategory] = useDeleteCategoryMutation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !category) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/categories')}>
          <ChevronLeft className="size-4" />
          Back to categories
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load category details.
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(category._id).unwrap()
      toast.success('Category deleted successfully')
      router.push('/categories')
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => router.push('/categories')}>
          <ChevronLeft className="size-4" />
          Back to categories
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {category.description || 'No description provided.'}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Slug</p>
            <p className="mt-1">{category.slug}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">
              Sort Order
            </p>
            <p className="mt-1">{category.sortOrder}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Books</p>
            <p className="mt-1">{category.booksCount}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Status</p>
            <p className="mt-1">{category.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
