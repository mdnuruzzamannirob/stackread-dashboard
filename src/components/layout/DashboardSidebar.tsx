'use client'

import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { toggleSidebar } from '@/lib/redux/uiSlice'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function DashboardSidebar() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)

  const navItems = [
    { label: 'navigation.dashboard', href: '/dashboard' },
    { label: 'navigation.staff', href: '/dashboard/staff' },
    { label: 'navigation.members', href: '/dashboard/members' },
    { label: 'navigation.books', href: '/dashboard/books' },
    { label: 'navigation.borrows', href: '/dashboard/borrows' },
    { label: 'navigation.reservations', href: '/dashboard/reservations' },
    { label: 'navigation.payments', href: '/dashboard/payments' },
    { label: 'navigation.subscriptions', href: '/dashboard/subscriptions' },
    { label: 'navigation.promotions', href: '/dashboard/promotions' },
    { label: 'navigation.reports', href: '/dashboard/reports' },
    { label: 'navigation.settings', href: '/dashboard/settings' },
    { label: 'navigation.audit', href: '/dashboard/audit' },
  ]

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
              className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              {!sidebarCollapsed && t(item.label)}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
