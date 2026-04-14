'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { RbacManagement } from '@/components/modules/rbac/RbacManagement'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function RbacRolesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.RBAC_VIEW}>
      <RbacManagement />
    </PermissionGuard>
  )
}
