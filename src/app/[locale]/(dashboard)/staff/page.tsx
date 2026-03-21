'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { StaffManagement } from '@/components/modules/staff/StaffManagement'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function StaffPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.STAFF_VIEW}>
      <StaffManagement />
    </PermissionGuard>
  )
}
