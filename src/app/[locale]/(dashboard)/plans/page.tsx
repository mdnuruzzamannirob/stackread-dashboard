'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PlansList } from '@/components/modules/plans/PlansList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function PlansPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PLANS_MANAGE}>
      <PlansList />
    </PermissionGuard>
  )
}
