'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { ReportsList } from '@/components/modules/reports/ReportsList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function ReportsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.REPORTS_VIEW}>
      <ReportsList />
    </PermissionGuard>
  )
}
