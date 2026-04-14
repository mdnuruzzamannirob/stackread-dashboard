'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { MembersList } from '@/components/modules/members/MembersList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function MembersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.MEMBERS_VIEW}>
      <MembersList />
    </PermissionGuard>
  )
}
