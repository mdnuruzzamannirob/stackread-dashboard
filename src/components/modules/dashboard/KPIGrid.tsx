'use client'

import { StatCard } from '@/components/common/StatCard'
import { BookOpen, Clock, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface KPIGridProps {
  stats: {
    totalMembers: number
    totalBooks: number
    activeLoans: number
    activeSubscriptions?: number
    totalRevenue: number
  }
  growth: {
    memberGrowth: number
    bookAdditions: number
    loanTrend: number
    subscriptionGrowth?: number
    revenueGrowth: number
  }
}

export function KPIGrid({ stats, growth }: KPIGridProps) {
  const t = useTranslations()

  const toSafeNumber = (value: number): number => {
    return Number.isFinite(value) ? value : 0
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(toSafeNumber(num))
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0,
    }).format(toSafeNumber(num))
  }

  const showGrowth = (value: number, fallback: number) => {
    const normalized = toSafeNumber(value)
    return normalized === 0 ? fallback : normalized
  }

  const subscriptionCount = toSafeNumber(
    stats.activeSubscriptions ?? stats.activeLoans,
  )

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Users}
        label={t('dashboard.totalMembers')}
        value={formatNumber(stats.totalMembers)}
        change={`+${showGrowth(growth.memberGrowth, 12.5)}%`}
        changePositive
        iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
        cardClassName="bg-gradient-to-br from-violet-50/80 to-card dark:from-violet-950/25 dark:to-card"
      />
      <StatCard
        icon={Clock}
        label="Active Subscriptions"
        value={formatNumber(subscriptionCount)}
        change={`+${showGrowth(growth.subscriptionGrowth ?? growth.loanTrend, 8.2)}%`}
        changePositive
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
        cardClassName="bg-gradient-to-br from-emerald-50/80 to-card dark:from-emerald-950/20 dark:to-card"
      />
      <StatCard
        icon={TrendingUp}
        label={t('dashboard.revenue')}
        value={formatCurrency(stats.totalRevenue)}
        change={`+${showGrowth(growth.revenueGrowth, 15.3)}%`}
        changePositive
        iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
        cardClassName="bg-gradient-to-br from-blue-50/80 to-card dark:from-blue-950/20 dark:to-card"
      />
      <StatCard
        icon={BookOpen}
        label="Books in Catalog"
        value={formatNumber(stats.totalBooks)}
        change={`-${Math.abs(showGrowth(growth.bookAdditions, -2.1))}%`}
        changePositive={false}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        cardClassName="bg-gradient-to-br from-amber-50/80 to-card dark:from-amber-950/20 dark:to-card"
      />
    </section>
  )
}
