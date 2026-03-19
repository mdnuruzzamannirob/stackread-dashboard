'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { BooksList } from '@/components/modules/books/BooksList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function BooksPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BOOKS_VIEW}>
      <BooksList />
    </PermissionGuard>
  )
}
