'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  change?: string
  changePositive?: boolean
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changePositive,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {Icon && <Icon className="size-5 text-muted-foreground" />}
      </div>
      {change && (
        <p
          className={`mt-2 text-xs ${changePositive ? 'text-green-600' : 'text-red-600'}`}
        >
          {change}
        </p>
      )}
    </div>
  )
}
