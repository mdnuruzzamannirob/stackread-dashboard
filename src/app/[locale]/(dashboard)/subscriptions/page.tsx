'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { SubscriptionsList } from '@/components/modules/subscriptions/SubscriptionsList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function SubscriptionsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.SUBSCRIPTIONS_VIEW}>
      <SubscriptionsList />
    </PermissionGuard>
  )
}
