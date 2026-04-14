'use client'

import { BrandLogo } from '@/components/layout/BrandLogo'
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slice/uiSlice'
import {
  Bell,
  BookOpen,
  BookOpenCheck,
  ChartBar,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  FileClock,
  Globe,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  TicketPercent,
  UserCog,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

export function DashboardSidebar() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const permissions = useAppSelector((state) => state.auth.permissions)
  const staff = useAppSelector((state) => state.auth.staff)
  const isHydrated = useAppSelector((state) => state.auth.isHydrated)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pathParts = useMemo(() => pathname.split('/'), [pathname])

  const navItems = [
    {
      section: 'OVERVIEW',
      items: [
        {
          label: 'navigation.dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      section: 'CONTENT',
      items: [
        {
          label: 'navigation.books',
          href: '/books',
          icon: BookOpen,
        },
        {
          label: 'navigation.categories',
          href: '/categories',
          icon: BookOpenCheck,
        },
        {
          label: 'navigation.authors',
          href: '/authors',
          icon: UsersRound,
        },
        {
          label: 'navigation.publishers',
          href: '/publishers',
          icon: Globe,
          requiredPermission: PERMISSIONS.PUBLISHERS_MANAGE,
        },
      ],
    },
    {
      section: 'COMMUNICATIONS',
      items: [
        {
          label: 'navigation.notifications',
          href: '/notifications',
          icon: Bell,
          requiredPermission: PERMISSIONS.NOTIFICATIONS_MANAGE,
        },
        {
          label: 'navigation.reviews',
          href: '/reviews',
          icon: MessageSquare,
          requiredPermission: PERMISSIONS.REVIEWS_VIEW,
        },
      ],
    },
    {
      section: 'MEMBERS',
      items: [
        {
          label: 'navigation.members',
          href: '/members',
          icon: Users,
          requiredPermission: PERMISSIONS.MEMBERS_VIEW,
        },
        {
          label: 'navigation.subscriptions',
          href: '/subscriptions',
          icon: TicketPercent,
          requiredPermission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
        },
      ],
    },
    {
      section: 'FINANCE',
      items: [
        {
          label: 'navigation.plans',
          href: '/plans',
          icon: TicketPercent,
          requiredPermission: PERMISSIONS.PLANS_MANAGE,
        },
        {
          label: 'navigation.payments',
          href: '/payments',
          icon: CircleDollarSign,
          requiredPermission: PERMISSIONS.PAYMENTS_VIEW,
        },
        {
          label: 'navigation.promotions',
          href: '/promotions',
          icon: TicketPercent,
          requiredPermission: PERMISSIONS.PROMOTIONS_VIEW,
        },
      ],
    },
    {
      section: 'OPERATIONS',
      items: [
        {
          label: 'navigation.reports',
          href: '/reports',
          icon: ChartBar,
          requiredPermission: PERMISSIONS.REPORTS_VIEW,
        },
        {
          label: 'navigation.audit',
          href: '/audit',
          icon: FileClock,
          requiredPermission: PERMISSIONS.AUDIT_VIEW,
        },
      ],
    },
    {
      section: 'SYSTEM',
      items: [
        {
          label: 'navigation.staff',
          href: '/staff',
          icon: UserCog,
          requiredPermission: PERMISSIONS.STAFF_VIEW,
        },
        {
          label: 'navigation.rbac',
          href: '/rbac/roles',
          icon: Shield,
          requiredPermission: PERMISSIONS.RBAC_VIEW,
        },
        {
          label: 'navigation.settings',
          href: '/settings',
          icon: Settings,
          requiredPermission: PERMISSIONS.SETTINGS_VIEW,
        },
      ],
    },
  ]

  const navSections = navItems
    .map((section) => ({
      section: section.section,
      items: section.items.filter((item) => {
        if (staff?.role === 'super-admin') {
          return true
        }

        return item.requiredPermission
          ? hasPermission(permissions, item.requiredPermission)
          : true
      }),
    }))
    .filter((section) => section.items.length > 0)

  const isActive = (href: string): boolean => {
    const pathWithoutLocale = '/' + pathParts.slice(2).join('/')

    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
    )
  }

  const isCollapsedView = sidebarCollapsed && !mobileOpen
  const sidebarBaseClass = isCollapsedView ? 'w-16 md:w-16' : 'w-72 md:w-72'

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-foreground md:hidden"
        aria-label="Open sidebar"
        title="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground  md:sticky md:top-0 md:z-30 ${sidebarBaseClass} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div
            className={`flex h-16 items-center gap-2 border-b border-sidebar-border px-3 ${isCollapsedView ? 'justify-center' : 'justify-between'} md:h-18`}
          >
            <BrandLogo
              href={`/${locale}/dashboard`}
              collapsed={isCollapsedView}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
                aria-label="Close sidebar"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <nav
            className={`mt-3 flex-1 space-y-1 overflow-y-auto ${
              isCollapsedView ? 'px-1.5' : 'px-3'
            } ${
              !isHydrated ? 'pointer-events-none opacity-60' : 'opacity-100'
            }`}
          >
            {navSections.map((section) => (
              <div key={section.section} className="space-y-1">
                {!isCollapsedView && (
                  <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/55">
                    {t(`sidebar.sections.${section.section.toLowerCase()}`)}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href}`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg py-2 text-sm ${
                        isActive(item.href)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      } ${
                        isCollapsedView
                          ? 'mx-auto size-10 justify-center p-0'
                          : 'px-3'
                      }`}
                      title={isCollapsedView ? t(item.label) : undefined}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!isCollapsedView && <span>{t(item.label)}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="hidden border-t border-sidebar-border p-3 md:block">
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className={`inline-flex h-10 items-center justify-center rounded-lg border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent ${
                isCollapsedView ? 'w-10' : 'w-full gap-2'
              }`}
              aria-label={
                isCollapsedView ? 'Expand sidebar' : 'Collapse sidebar'
              }
              title={isCollapsedView ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsedView ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
              {!isCollapsedView && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
