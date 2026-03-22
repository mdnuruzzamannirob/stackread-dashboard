'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PublishersList } from '@/components/modules/publishers/PublishersList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function PublishersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PUBLISHERS_MANAGE}>
      <PublishersList />
    </PermissionGuard>
  )
}
