'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { AuthorsList } from '@/components/modules/authors/AuthorsList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function AuthorsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.AUTHORS_MANAGE}>
      <AuthorsList />
    </PermissionGuard>
  )
}
