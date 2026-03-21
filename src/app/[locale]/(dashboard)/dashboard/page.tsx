'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import { ActivityFeed } from '@/components/modules/dashboard/ActivityFeed'
import { KPIGrid } from '@/components/modules/dashboard/KPIGrid'
import { RevenueTrendChart } from '@/components/modules/dashboard/RevenueTrendChart'
import {
  useGetAdminOverviewQuery,
  useGetAuditLogsQuery,
} from '@/store/api/dashboardApi'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations()
  const { data: overviewData, isLoading: isOverviewLoading } =
    useGetAdminOverviewQuery({ period: 'month' })
  const { data: auditData, isLoading: isAuditLoading } = useGetAuditLogsQuery({
    page: 1,
    limit: 10,
  })

  if (isOverviewLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  console.log(overviewData)
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.welcome')}
        description={t('dashboard.overview')}
      />

      {overviewData && (
        <>
          <KPIGrid
            stats={{
              totalMembers: overviewData.stats?.totalMembers,
              totalBooks: overviewData.stats?.totalBooks,
              activeLoans: overviewData.stats?.activeLoans,
              totalRevenue: overviewData.stats?.totalRevenue,
            }}
            growth={{
              memberGrowth: overviewData.stats?.memberGrowth,
              bookAdditions: overviewData.stats?.bookAdditions,
              loanTrend: overviewData.stats?.loanTrend,
              revenueGrowth: overviewData.stats?.revenueGrowth,
            }}
          />

          <RevenueTrendChart
            data={overviewData.revenueTrend}
            isLoading={isOverviewLoading}
          />

          <ActivityFeed
            activities={auditData?.data || overviewData.activityLog}
            isLoading={isAuditLoading}
            maxItems={10}
          />
        </>
      )}
    </div>
  )
}
