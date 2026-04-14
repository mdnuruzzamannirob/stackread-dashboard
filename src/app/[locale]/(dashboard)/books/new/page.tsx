'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { BookFormDialog } from '@/components/modules/books/BookFormDialog'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useRouter } from 'next/navigation'

export default function NewBookPage() {
  const router = useRouter()

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.BOOKS_MANAGE}>
      <BookFormDialog onClose={() => router.push('/books')} />
    </PermissionGuard>
  )
}
