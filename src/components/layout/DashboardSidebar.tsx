'use client'

import { BrandLogo } from '@/components/layout/BrandLogo'
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slice/uiSlice'
import {
  BookOpen,
  BookOpenCheck,
  ChartBar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileClock,
  Globe,
  LayoutDashboard,
  Menu,
  Moon,
  Receipt,
  Settings,
  Shield,
  Sun,
  TicketPercent,
  UserCog,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useLogoutStaffMutation } from '@/store/api/authApi'
import { clearAuth } from '@/store/slice/authSlice'

export function DashboardSidebar() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const permissions = useAppSelector((state) => state.auth.permissions)
  const staff = useAppSelector((state) => state.auth.staff)
  const isHydrated = useAppSelector((state) => state.auth.isHydrated)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoutStaff, { isLoading: isLogoutLoading }] = useLogoutStaffMutation()

  const pathParts = useMemo(() => pathname.split('/'), [pathname])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const navItems = [
    {
      label: 'navigation.dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'navigation.books',
      href: '/books',
      icon: BookOpen,
    },
    {
      label: 'navigation.authors',
      href: '/authors',
      icon: UsersRound,
    },
    {
      label: 'navigation.categories',
      href: '/categories',
      icon: BookOpenCheck,
    },
    {
      label: 'navigation.publishers',
      href: '/publishers',
      icon: Globe,
      requiredPermission: PERMISSIONS.PUBLISHERS_MANAGE,
    },
    {
      label: 'navigation.staff',
      href: '/staff',
      icon: UserCog,
      requiredPermission: PERMISSIONS.STAFF_VIEW,
    },
    {
      label: 'navigation.rbac',
      href: '/rbac',
      icon: Shield,
      requiredPermission: PERMISSIONS.RBAC_VIEW,
    },
    {
      label: 'navigation.members',
      href: '/members',
      icon: Users,
      requiredPermission: PERMISSIONS.MEMBERS_VIEW,
    },
    {
      label: 'navigation.borrows',
      href: '/borrows',
      icon: Receipt,
      requiredPermission: PERMISSIONS.BORROWS_VIEW,
    },
    {
      label: 'navigation.reservations',
      href: '/reservations',
      icon: FileClock,
      requiredPermission: PERMISSIONS.RESERVATIONS_VIEW,
    },
    {
      label: 'navigation.payments',
      href: '/payments',
      icon: CircleDollarSign,
      requiredPermission: PERMISSIONS.PAYMENTS_VIEW,
    },
    {
      label: 'navigation.subscriptions',
      href: '/subscriptions',
      icon: TicketPercent,
      requiredPermission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      label: 'navigation.promotions',
      href: '/promotions',
      icon: TicketPercent,
      requiredPermission: PERMISSIONS.PROMOTIONS_VIEW,
    },
    {
      label: 'navigation.reports',
      href: '/reports',
      icon: ChartBar,
      requiredPermission: PERMISSIONS.REPORTS_VIEW,
    },
    {
      label: 'navigation.settings',
      href: '/settings',
      icon: Settings,
      requiredPermission: PERMISSIONS.SETTINGS_VIEW,
    },
    {
      label: 'navigation.audit',
      href: '/audit',
      icon: FileClock,
      requiredPermission: PERMISSIONS.AUDIT_VIEW,
    },
  ].filter((item) => {
    if (staff?.role === 'super-admin') {
      return true
    }

    return item.requiredPermission
      ? hasPermission(permissions, item.requiredPermission)
      : true
  })

  const isActive = (href: string): boolean => {
    const pathWithoutLocale = '/' + pathParts.slice(2).join('/')

    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
    )
  }

  const handleLogout = useCallback(async () => {
    try {
      await logoutStaff().unwrap()
      toast.success(t('auth.logoutSuccess'))
    } catch {
      toast.error(t('auth.logoutFailed'))
    } finally {
      clearSessionTokenCookie()
      clearTempTokenStorage()
      dispatch(clearAuth())
      setUserMenuOpen(false)
      router.replace(`/${locale}/login`)
    }
  }, [dispatch, locale, logoutStaff, router, t])

  const handleLocaleToggle = useCallback(() => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn'
    const restPath = pathParts.slice(2).join('/')
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const nextPath = restPath ? `/${nextLocale}/${restPath}` : `/${nextLocale}`
    router.replace(`${nextPath}${search}${hash}`)
  }, [locale, pathParts, router])

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const sidebarBaseClass = sidebarCollapsed ? 'w-20' : 'w-72'

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
        className={`fixed inset-y-0 left-0 z-50 flex border-r border-border bg-sidebar text-sidebar-foreground md:static md:z-auto ${sidebarBaseClass} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex h-full w-full flex-col p-3">
          <div className="flex items-center justify-between gap-2 border-b border-sidebar-border pb-3">
            <BrandLogo
              href={`/${locale}/dashboard`}
              collapsed={sidebarCollapsed}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => dispatch(toggleSidebar())}
                className="hidden rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent md:inline-flex"
                aria-label={
                  sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </button>
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
              !isHydrated ? 'pointer-events-none opacity-60' : 'opacity-100'
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    isActive(item.href)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  title={sidebarCollapsed ? t(item.label) : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t(item.label)}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="mt-3 border-t border-sidebar-border pt-3">
            <div
              className={`mb-3 flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
            >
              <button
                type="button"
                onClick={handleThemeToggle}
                className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-sidebar-accent"
                title={
                  resolvedTheme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
                aria-label={
                  resolvedTheme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleLocaleToggle}
                className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-sidebar-accent"
                title={
                  locale === 'bn' ? 'Switch to English' : 'Switch to বাংলা'
                }
                aria-label={
                  locale === 'bn' ? 'Switch to English' : 'Switch to বাংলা'
                }
              >
                <Globe className="size-4" />
              </button>
              {!sidebarCollapsed && (
                <span className="text-xs text-sidebar-foreground/80">
                  {locale === 'bn' ? 'বাংলা' : 'English'}
                </span>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`flex w-full items-center gap-2 rounded-lg p-2 hover:bg-sidebar-accent ${
                  sidebarCollapsed ? 'justify-center' : 'justify-between'
                }`}
                title={
                  sidebarCollapsed ? staff?.name || 'User menu' : undefined
                }
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {staff?.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-medium">
                        {staff?.name || 'Staff'}
                      </span>
                      <span className="block truncate text-xs text-sidebar-foreground/70">
                        {staff?.role || 'member'}
                      </span>
                    </span>
                    <ChevronDown className="size-4" />
                  </>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-12 left-0 z-50 w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg">
                  <Link
                    href={`/${locale}/profile`}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('navigation.profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLogoutLoading}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-muted disabled:opacity-60"
                  >
                    {isLogoutLoading
                      ? t('auth.loggingOut')
                      : t('navigation.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
