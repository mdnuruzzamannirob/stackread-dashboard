'use client'

import { PermissionGuard } from '@/components/common/PermissionGuard'
import { CategoriesList } from '@/components/modules/categories/CategoriesList'
import { PERMISSIONS } from '@/constants/permissions'

export default function CategoriesPage() {
  return (
    <PermissionGuard permissions={[PERMISSIONS.CATEGORIES_VIEW]}>
      <CategoriesList />
    </PermissionGuard>
  )
}
