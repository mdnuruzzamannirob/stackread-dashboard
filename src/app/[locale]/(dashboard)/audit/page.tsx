'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { AuditLogsTable } from '@/components/modules/audit/AuditLogsTable'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function AuditPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.AUDIT_VIEW}>
      <AuditLogsTable />
    </PermissionGuard>
  )
}
