'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { BookOpen, Clock, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.welcome')}
        description={t('dashboard.overview')}
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('dashboard.totalMembers')}
          value="1,234"
          change="+12% from last month"
          changePositive
        />
        <StatCard
          icon={BookOpen}
          label={t('dashboard.totalBooks')}
          value="5,678"
          change="+5% from last month"
          changePositive
        />
        <StatCard
          icon={TrendingUp}
          label={t('dashboard.activeLoans')}
          value="432"
          change="-2% from last month"
          changePositive={false}
        />
        <StatCard
          icon={Clock}
          label={t('dashboard.pendingApprovals')}
          value="12"
          change="No change"
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">
          {t('dashboard.recentActivity')}
        </h2>
        <p className="text-sm text-muted-foreground">Phase 1 Placeholder</p>
      </section>
    </div>
  )
}
