'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { BooksList } from '@/components/modules/books/BooksList'
import { PERMISSIONS } from '@/constants/permissions'

export default function BooksPage() {
  return (
    <PermissionGuard permissions={[PERMISSIONS.BOOKS_VIEW]}>
      <BooksList />
    </PermissionGuard>
  )
}
