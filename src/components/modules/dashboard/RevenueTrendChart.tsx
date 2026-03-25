'use client'

import { useTranslations } from 'next-intl'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface RevenueTrendPoint {
  date: string
  revenue: number
}

export interface RevenueTrendChartProps {
  data: RevenueTrendPoint[]
  height?: number
  isLoading?: boolean
  title?: string
  className?: string
}

export function RevenueTrendChart({
  data,
  height = 300,
  isLoading = false,
  title,
  className,
}: RevenueTrendChartProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-6 animate-pulse"
        style={{ height }}
      >
        <div className="h-full bg-muted rounded"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-6 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 sm:p-6 ${className ?? ''}`}
    >
      <h2 className="mb-5 text-base font-semibold sm:text-lg">
        {title ?? `${t('dashboard.revenueTrend')} (30 Days)`}
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.35} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            fontSize={11}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          />
          <Tooltip
            formatter={(value) => [
              `৳${Number(value).toLocaleString('en-US')}`,
              t('dashboard.revenue'),
            ]}
            labelStyle={{ color: 'black' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
