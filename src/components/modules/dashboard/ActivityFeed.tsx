'use client'

import { format } from 'date-fns'
import { bn, enUS } from 'date-fns/locale'
import { Activity, Bell, BookOpen, UserPlus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

export interface ActivityLogItem {
  _id: string
  action: string
  actor: string
  target: string
  targetType: string
  timestamp: string
  details?: Record<string, string | number>
}

export interface ActivityFeedProps {
  activities: ActivityLogItem[]
  isLoading?: boolean
  maxItems?: number
}

export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 10,
}: ActivityFeedProps) {
  const t = useTranslations()
  const locale = useLocale()
  const dateLocale = locale === 'bn' ? bn : enUS

  const displayActivities = activities?.slice(0, maxItems)

  const relativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
      return ''
    }

    const diffMs = date.getTime() - Date.now()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
    })

    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute')
    }

    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, 'hour')
    }

    const diffDays = Math.round(diffHours / 24)
    return formatter.format(diffDays, 'day')
  }

  const getActionLabel = (action: string): string => {
    const actionMap: Record<string, string> = {
      CREATED: t('activities.created'),
      UPDATED: t('activities.updated'),
      DELETED: t('activities.deleted'),
      VIEWED: t('activities.viewed'),
      EXPORTED: t('activities.exported'),
    }
    return actionMap[action] || action
  }

  const getIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return UserPlus
      case 'UPDATED':
        return Activity
      case 'EXPORTED':
        return Bell
      default:
        return BookOpen
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">
          {t('dashboard.recentActivity')}
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="w-2 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!displayActivities || displayActivities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4">
          {t('dashboard.recentActivity')}
        </h2>
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('common.noResults')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold sm:text-lg">
        {t('dashboard.recentActivity')}
      </h2>
      <div className="space-y-1">
        {displayActivities.map((activity) => {
          const Icon = getIcon(activity.action)
          return (
            <div
              key={activity._id}
              className="flex items-start gap-3 rounded-lg px-1 py-2 sm:px-2"
            >
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  <span className="font-semibold">{activity.actor}</span>{' '}
                  <span className="text-muted-foreground">
                    {getActionLabel(activity.action)}
                  </span>{' '}
                  <span className="font-semibold">{activity.target}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {relativeTime(activity.timestamp) ||
                    format(new Date(activity.timestamp), 'PPpp', {
                      locale: dateLocale,
                    })}
                </p>
              </div>
              <span className="hidden text-xs text-muted-foreground/80 md:block">
                {format(new Date(activity.timestamp), 'p', {
                  locale: dateLocale,
                })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
