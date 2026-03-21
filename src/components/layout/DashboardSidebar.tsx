'use client'

import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slice/uiSlice'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function DashboardSidebar() {
  const t = useTranslations()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const permissions = useAppSelector((state) => state.auth.permissions)
  const staff = useAppSelector((state) => state.auth)
  const isHydrated = useAppSelector((state) => state.auth.isHydrated)

  const pathParts = pathname.split('/')
  const locale = pathParts[1] || 'en'

  const navItems = [
    { label: 'navigation.dashboard', href: '/dashboard' },
    {
      label: 'navigation.books',
      href: '/books',
    },
    {
      label: 'navigation.authors',
      href: '/authors',
    },
    {
      label: 'navigation.categories',
      href: '/categories',
    },
    {
      label: 'navigation.staff',
      href: '/staff',
      requiredPermission: PERMISSIONS.STAFF_VIEW,
    },
    {
      label: 'navigation.rbac',
      href: '/rbac',
      requiredPermission: PERMISSIONS.RBAC_VIEW,
    },
    {
      label: 'navigation.members',
      href: '/members',
      requiredPermission: PERMISSIONS.MEMBERS_VIEW,
    },
    {
      label: 'navigation.borrows',
      href: '/borrows',
      requiredPermission: PERMISSIONS.BORROWS_VIEW,
    },
    {
      label: 'navigation.reservations',
      href: '/reservations',
      requiredPermission: PERMISSIONS.RESERVATIONS_VIEW,
    },
    {
      label: 'navigation.payments',
      href: '/payments',
      requiredPermission: PERMISSIONS.PAYMENTS_VIEW,
    },
    {
      label: 'navigation.subscriptions',
      href: '/subscriptions',
      requiredPermission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      label: 'navigation.promotions',
      href: '/promotions',
      requiredPermission: PERMISSIONS.PROMOTIONS_VIEW,
    },
    {
      label: 'navigation.reports',
      href: '/reports',
      requiredPermission: PERMISSIONS.REPORTS_VIEW,
    },
    {
      label: 'navigation.settings',
      href: '/settings',
      requiredPermission: PERMISSIONS.SETTINGS_VIEW,
    },
    {
      label: 'navigation.audit',
      href: '/audit',
      requiredPermission: PERMISSIONS.AUDIT_VIEW,
    },
  ].filter((item) => {
    // Show all items if still hydrating (loading auth state)
    if (!isHydrated) {
      return true
    }

    // Show all items for super-admin after hydrated
    if (staff.staff?.role === 'super-admin') {
      console.log('object')
      return true
    }

    // For regular users, check permission after hydrated
    return item.requiredPermission
      ? hasPermission(permissions, item.requiredPermission)
      : true
  })

  const isActive = (href: string): boolean => {
    // Remove locale prefix from pathname for comparison
    // pathname format: /en/dashboard or /bn/dashboard or similar
    const pathWithoutLocale = '/' + pathParts.slice(2).join('/')

    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
    )
  }
  console.log(staff, navItems)
  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border bg-background transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col gap-4 p-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center rounded-lg hover:bg-muted"
        >
          {sidebarCollapsed ? (
            <Menu className="size-5" />
          ) : (
            <X className="size-5" />
          )}
        </button>

        <nav
          className={`space-y-2 transition-opacity duration-300 ${
            !isHydrated ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {!sidebarCollapsed && t(item.label)}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
