'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { AuthorsList } from '@/components/modules/authors/AuthorsList'
import { PERMISSIONS } from '@/constants/permissions'

export default function AuthorsPage() {
  return (
    <PermissionGuard permissions={[PERMISSIONS.AUTHORS_VIEW]}>
      <AuthorsList />
    </PermissionGuard>
  )
}
