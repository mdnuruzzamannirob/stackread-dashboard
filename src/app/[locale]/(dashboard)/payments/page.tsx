'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PaymentsList } from '@/components/modules/payments/PaymentsList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function PaymentsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PAYMENTS_VIEW}>
      <PaymentsList />
    </PermissionGuard>
  )
}
