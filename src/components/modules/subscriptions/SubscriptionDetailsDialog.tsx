'use client'

import { Subscription } from '@/store/api/subscriptionsApi'
import { useTranslations } from 'next-intl'

interface SubscriptionDetailsDialogProps {
  subscription: Subscription
  onClose: () => void
}

export function SubscriptionDetailsDialog({
  subscription,
  onClose,
}: SubscriptionDetailsDialogProps) {
  const t = useTranslations()

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-700 dark:text-green-400',
    expired: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    cancelled: 'bg-red-500/20 text-red-700 dark:text-red-400',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{subscription.planName}</h2>
            <p className="text-sm text-muted-foreground">
              {t('subscriptions.memberId')}: {subscription.memberId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-4 font-semibold">{t('common.details')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('subscriptions.status')}:
                </span>
                <span
                  className={`rounded px-2 py-1 ${
                    statusColors[subscription.status] || ''
                  }`}
                >
                  {subscription.status === 'active'
                    ? t('subscriptions.statusActive')
                    : subscription.status === 'expired'
                      ? t('subscriptions.statusExpired')
                      : t('subscriptions.statusCancelled')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('subscriptions.autoRenew')}:
                </span>
                <span>{subscription.autoRenew ? '✓' : '–'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('subscriptions.renewalAttempts')}:
                </span>
                <span>{subscription.renewalAttempts}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">{t('subscriptions.dates')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('subscriptions.startDate')}:
                </span>
                <span>
                  {new Date(subscription.startDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('subscriptions.endDate')}:
                </span>
                <span>
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>

              {subscription.nextRenewalAttempt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('subscriptions.nextRenewal')}:
                  </span>
                  <span>
                    {new Date(
                      subscription.nextRenewalAttempt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {subscription.cancellationReason && (
          <div className="mb-6 rounded-lg border border-border/50 bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-semibold">
              {t('subscriptions.cancellationReason')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {subscription.cancellationReason}
            </p>
            {subscription.cancelledAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Cancelled on:{' '}
                {new Date(subscription.cancelledAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
