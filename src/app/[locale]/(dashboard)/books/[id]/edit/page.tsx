'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { BookFormDialog } from '@/components/modules/books/BookFormDialog'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useGetBookByIdQuery } from '@/store/api/booksApi'
import { useParams, useRouter } from 'next/navigation'

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const bookId = params?.id
  const { data: book, isLoading } = useGetBookByIdQuery(bookId || '', {
    skip: !bookId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BOOKS_MANAGE}>
      <BookFormDialog
        book={book ?? undefined}
        onClose={() => router.push(`/books/${bookId || ''}`)}
      />
    </PermissionGuard>
  )
}
