'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { CategoriesList } from '@/components/modules/categories/CategoriesList'
import { PERMISSIONS } from '@/lib/auth/permissions'

export default function CategoriesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.CATEGORIES_VIEW}>
      <CategoriesList />
    </PermissionGuard>
  )
}
