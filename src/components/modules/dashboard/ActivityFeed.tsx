'use client'

import { format } from 'date-fns'
import { bn, enUS } from 'date-fns/locale'
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
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-bold mb-4">
        {t('dashboard.recentActivity')}
      </h2>
      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <div key={activity._id} className="flex gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
              {index < displayActivities.length - 1 && (
                <div className="w-0.5 h-12 bg-border my-2"></div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                <span className="font-semibold">{activity.actor}</span>{' '}
                <span className="text-muted-foreground">
                  {getActionLabel(activity.action)}
                </span>{' '}
                <span className="font-semibold">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(activity.timestamp), 'PPpp', {
                  locale: dateLocale,
                })}
              </p>
              {activity.details && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.entries(activity.details)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
