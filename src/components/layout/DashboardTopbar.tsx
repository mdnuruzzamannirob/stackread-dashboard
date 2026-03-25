'use client'

import { Bell, Keyboard, LogOut, Moon, Search, Sun, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useLogoutStaffMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearAuth } from '@/store/slice/authSlice'
import { useTheme } from 'next-themes'

export function DashboardTopbar() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { resolvedTheme, setTheme } = useTheme()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)
  const staff = useAppSelector((state) => state.auth.staff)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [logoutStaff, { isLoading: isLogoutLoading }] = useLogoutStaffMutation()

  const pageTitle = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean)
    const withoutLocale = parts.slice(1)
    const current = withoutLocale[withoutLocale.length - 1] || 'dashboard'

    if (current === 'audit') {
      return t('topbar.auditLogs')
    }

    const supportedKeys = new Set([
      'dashboard',
      'books',
      'categories',
      'authors',
      'publishers',
      'members',
      'subscriptions',
      'payments',
      'promotions',
      'reports',
      'staff',
      'rbac',
      'settings',
      'profile',
    ])

    if (supportedKeys.has(current)) {
      return t(`navigation.${current}`)
    }

    return current.charAt(0).toUpperCase() + current.slice(1)
  }, [pathname, t])

  const handleThemeToggle = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const handleLocaleToggle = useCallback(() => {
    const nextLocale = locale === 'bn' ? 'en' : 'bn'
    const pathParts = pathname.split('/').filter(Boolean)
    const restPath = pathParts.slice(1).join('/')
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const nextPath = restPath ? `/${nextLocale}/${restPath}` : `/${nextLocale}`
    router.replace(`${nextPath}${search}${hash}`)
  }, [locale, pathname, router])

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
      setIsUserMenuOpen(false)
      router.replace(`/${locale}/login`)
    }
  }, [dispatch, locale, logoutStaff, router, t])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key === 'k'
      if (isShortcut) {
        event.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isUserMenuOpen])

  return (
    <>
      <header
        className={`fixed right-0 top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur md:h-18 ${sidebarCollapsed ? 'md:left-16' : 'md:left-72'} left-0`}
      >
        <div className="flex h-full items-center justify-between gap-3 px-4 pl-16 sm:px-5 sm:pl-16 md:px-6 md:pl-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-xl">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden h-9 w-64 items-center justify-between rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground md:inline-flex lg:w-96"
              aria-label="Open search"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="size-4" />
                {t('topbar.searchPlaceholder')}
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                <Keyboard className="size-3" />
                Ctrl K
              </span>
            </button>
            <button
              type="button"
              onClick={handleThemeToggle}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
              aria-label={t('topbar.toggleTheme')}
              title={t('topbar.toggleTheme')}
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
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
              aria-label={t('topbar.toggleLanguage')}
              title={t('topbar.toggleLanguage')}
            >
              <span className="text-[11px] font-semibold leading-none">
                {locale === 'bn' ? 'বাং' : 'EN'}
              </span>
            </button>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-primary bg-primary text-sm font-medium text-primary-foreground"
                aria-label="Open user menu"
              >
                {(staff?.name?.charAt(0) || 'A').toUpperCase()}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-in fade-in zoom-in-95">
                  {/* Header */}
                  <div className="border-b border-border/60 bg-muted/40 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        {staff?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {staff?.name || t('topbar.adminUser')}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {staff?.role || t('topbar.superAdmin')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href={`/${locale}/profile`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted"
                    >
                      <User className="size-4" />
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLogoutLoading}
                      className="flex items-center w-full gap-3 rounded-md px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="mx-auto mt-20 w-[min(680px,calc(100%-2rem))]">
            <div
              className="rounded-xl border border-border bg-popover p-3 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
                <Search className="size-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('topbar.searchDialogPlaceholder')}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  <Keyboard className="size-3" />
                  ESC
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
