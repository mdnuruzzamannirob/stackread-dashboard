'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { CouponsList } from '@/components/modules/promotions/CouponsList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function CouponsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PROMOTIONS_VIEW}>
      <CouponsList />
    </PermissionGuard>
  )
}
