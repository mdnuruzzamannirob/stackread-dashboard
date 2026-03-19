'use client'

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

  const navItems = [
    { label: 'navigation.dashboard', href: '/dashboard' },
    { label: 'navigation.books', href: '/books' },
    { label: 'authors.title', href: '/authors' },
    { label: 'categories.title', href: '/categories' },
    { label: 'navigation.staff', href: '/staff' },
    { label: 'navigation.members', href: '/members' },
    { label: 'navigation.borrows', href: '/borrows' },
    { label: 'navigation.reservations', href: '/reservations' },
    { label: 'navigation.payments', href: '/payments' },
    { label: 'navigation.subscriptions', href: '/subscriptions' },
    { label: 'navigation.promotions', href: '/promotions' },
    { label: 'navigation.reports', href: '/reports' },
    { label: 'navigation.settings', href: '/settings' },
    { label: 'navigation.audit', href: '/audit' },
  ]

  const isActive = (href: string): boolean => {
    // Remove locale prefix from pathname for comparison
    // pathname format: /en/dashboard or /bn/dashboard or similar
    const pathParts = pathname.split('/')
    const pathWithoutLocale = '/' + pathParts.slice(2).join('/')

    return (
      pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/')
    )
  }

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

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
