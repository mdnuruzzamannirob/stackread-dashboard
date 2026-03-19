'use client'

import { StatCard } from '@/components/common/StatCard'
import { BookOpen, Clock, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface KPIGridProps {
  stats: {
    totalMembers: number
    totalBooks: number
    activeLoans: number
    totalRevenue: number
  }
  growth: {
    memberGrowth: number
    bookAdditions: number
    loanTrend: number
    revenueGrowth: number
  }
}

export function KPIGrid({ stats, growth }: KPIGridProps) {
  const t = useTranslations()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num)
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Users}
        label={t('dashboard.totalMembers')}
        value={formatNumber(stats.totalMembers)}
        change={`${growth.memberGrowth > 0 ? '+' : ''}${growth.memberGrowth}% from last month`}
        changePositive={growth.memberGrowth >= 0}
      />
      <StatCard
        icon={BookOpen}
        label={t('dashboard.totalBooks')}
        value={formatNumber(stats.totalBooks)}
        change={`${growth.bookAdditions > 0 ? '+' : ''}${growth.bookAdditions}% from last month`}
        changePositive={growth.bookAdditions >= 0}
      />
      <StatCard
        icon={TrendingUp}
        label={t('dashboard.activeLoans')}
        value={formatNumber(stats.activeLoans)}
        change={`${growth.loanTrend > 0 ? '+' : ''}${growth.loanTrend}% from last month`}
        changePositive={growth.loanTrend >= 0}
      />
      <StatCard
        icon={Clock}
        label={t('dashboard.revenue')}
        value={formatCurrency(stats.totalRevenue)}
        change={`${growth.revenueGrowth > 0 ? '+' : ''}${growth.revenueGrowth}% from last month`}
        changePositive={growth.revenueGrowth >= 0}
      />
    </section>
  )
}
