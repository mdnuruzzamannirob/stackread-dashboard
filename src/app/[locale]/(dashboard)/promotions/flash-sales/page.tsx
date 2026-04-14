'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { FlashSalesList } from '@/components/modules/promotions/FlashSalesList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function FlashSalesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PROMOTIONS_VIEW}>
      <FlashSalesList />
    </PermissionGuard>
  )
}
