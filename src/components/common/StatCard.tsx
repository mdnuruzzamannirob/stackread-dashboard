'use client'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ComponentType<{ className?: string }>
  change?: string
  changePositive?: boolean
  iconClassName?: string
  cardClassName?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changePositive,
  iconClassName,
  cardClassName,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors sm:p-5 ${cardClassName ?? ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={`inline-flex size-9 items-center justify-center rounded-md ring-1 ring-black/5 dark:ring-white/10 ${iconClassName ?? 'bg-muted text-muted-foreground'}`}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      {change && (
        <p
          className={`mt-3 text-xs font-medium ${changePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {change}
        </p>
      )}
    </div>
  )
}
