'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ActivityFeed } from '@/components/modules/dashboard/ActivityFeed'
import { KPIGrid } from '@/components/modules/dashboard/KPIGrid'
import { RevenueTrendChart } from '@/components/modules/dashboard/RevenueTrendChart'
import {
  useGetAdminOverviewQuery,
  useGetAuditLogsQuery,
} from '@/store/api/dashboardApi'
import { useTranslations } from 'next-intl'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function DashboardPage() {
  const t = useTranslations()
  const { data: overviewData, isLoading: isOverviewLoading } =
    useGetAdminOverviewQuery({ period: 'month' })
  const {
    data: auditData,
    isLoading: isAuditLoading,
    isError: isAuditError,
  } = useGetAuditLogsQuery({
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

  if (!overviewData) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('errors.serverError')}
        </div>
      </div>
    )
  }

  const sourceStats = overviewData.stats
  const resolvedStats = {
    totalMembers: Number(sourceStats.totalMembers ?? 0),
    totalBooks: null,
    activeLoans: Number(sourceStats.activeLoans ?? 0),
    activeSubscriptions: Number(sourceStats.activeSubscriptions ?? 0),
    totalRevenue: Number(sourceStats.totalRevenue ?? 0),
  }

  const resolvedGrowth = {
    memberGrowth: Number(overviewData.stats?.memberGrowth ?? 0),
    bookAdditions: Number(overviewData.stats?.bookAdditions ?? 0),
    loanTrend: Number(overviewData.stats?.loanTrend ?? 0),
    subscriptionGrowth: Number(overviewData.stats?.subscriptionGrowth ?? 0),
    revenueGrowth: Number(overviewData.stats?.revenueGrowth ?? 0),
  }

  const revenueSeries = overviewData.revenueTrend ?? []

  const totalMembers = resolvedStats.totalMembers
  const activeSubscriptions = resolvedStats.activeSubscriptions
  const premium = Math.round(activeSubscriptions * 0.3)
  const basic = Math.max(activeSubscriptions - premium, 0)
  const free = Math.max(totalMembers - activeSubscriptions, 0)

  const subscriptionDistribution = [
    { name: 'Free', value: free, color: '#9ca3af' },
    { name: 'Basic', value: basic, color: '#2563eb' },
    { name: 'Premium', value: premium, color: '#f59e0b' },
  ]

  const borrowSeries = [
    {
      label: 'Borrowed',
      value: Number(overviewData.borrowStats.borrowed ?? 0),
    },
    {
      label: 'Returned',
      value: Number(overviewData.borrowStats.returned ?? 0),
    },
    {
      label: 'Overdue',
      value: Number(overviewData.borrowStats.overdue ?? 0),
    },
    {
      label: 'Cancelled',
      value: Number(overviewData.borrowStats.cancelled ?? 0),
    },
  ]

  const topBooks = overviewData.popularBooks.slice(0, 5)

  return (
    <div className="space-y-4 sm:space-y-6">
      <KPIGrid stats={resolvedStats} growth={resolvedGrowth} />

      <section className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8" style={{ height: 420 }}>
          <RevenueTrendChart
            data={revenueSeries}
            isLoading={isOverviewLoading}
            title="Revenue Trend (30 Days)"
            height={312}
            className="h-full"
          />
        </div>
        <article
          className="flex flex-col rounded-xl border border-border bg-card p-5 sm:p-6 xl:col-span-4"
          style={{ height: 420 }}
        >
          <h2 className="mb-4 text-base font-semibold sm:text-lg">
            Subscription Distribution
          </h2>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={58}
                  outerRadius={84}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {subscriptionDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => Number(value).toLocaleString('en-US')}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 pt-2">
            {subscriptionDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-medium text-foreground">
                  {item.value.toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article className="rounded-xl border border-border bg-card p-5 sm:p-6 xl:col-span-8">
          <h2 className="mb-4 text-base font-semibold sm:text-lg">
            Borrow Lifecycle Overview
          </h2>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={borrowSeries}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value) => Number(value).toLocaleString('en-US')}
                />
                <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6 xl:col-span-4">
          <h2 className="mb-4 text-base font-semibold sm:text-lg">
            Top 5 Most Read
          </h2>
          <div className="space-y-3">
            {topBooks.map((book, index) => {
              const maxCount = topBooks[0]?.borrowCount || 1
              const percentage = Math.max(
                (book.borrowCount / maxCount) * 100,
                6,
              )

              return (
                <div key={`${book.title}-${index}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="truncate text-muted-foreground">
                      {book.title}
                    </p>
                    <p className="font-medium text-foreground">
                      {book.borrowCount}
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      {isAuditError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('errors.serverError')}
        </div>
      ) : (
        <ActivityFeed
          activities={auditData?.data ?? overviewData.activityLog ?? []}
          isLoading={isAuditLoading}
          maxItems={10}
        />
      )}
    </div>
  )
}
