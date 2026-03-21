'use client'

import {
  hasPermission as canAccessPermission,
  hasAnyPermission,
} from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/store'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  requiredPermission?: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({
  requiredPermission,
  children,
  fallback,
}: PermissionGuardProps) {
  const t = useTranslations()
  const permissions = useAppSelector((state) => state.auth.permissions)

  // If no specific permission required, render children
  if (!requiredPermission) {
    return <>{children}</>
  }

  // Check if user has required permission(s)
  const isAllowed = Array.isArray(requiredPermission)
    ? hasAnyPermission(permissions, requiredPermission)
    : canAccessPermission(permissions, requiredPermission)

  if (!isAllowed) {
    return (
      fallback || (
        <div className="rounded-lg border border-border bg-card p-6 text-center py-12">
          <p className="text-muted-foreground">{t('errors.forbidden')}</p>
        </div>
      )
    )
  }

  return <>{children}</>
}
