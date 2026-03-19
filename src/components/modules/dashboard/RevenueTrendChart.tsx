'use client'

import { useTranslations } from 'next-intl'
import {
  CartesianGrid,
  Legend,
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
}

export function RevenueTrendChart({
  data,
  height = 300,
  isLoading = false,
}: RevenueTrendChartProps) {
  const t = useTranslations()

  if (isLoading) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-6 animate-pulse"
        style={{ height }}
      >
        <div className="h-full bg-muted rounded"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-border bg-card p-6 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-bold mb-4">{t('dashboard.revenueTrend')}</h2>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => `$${value.toLocaleString()}`}
            labelStyle={{ color: 'black' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name={t('dashboard.revenue')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
