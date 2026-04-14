'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  useGetSubscriptionByIdQuery,
  useUpdateSubscriptionMutation,
} from '@/store/api/subscriptionsApi'
import { ChevronLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

const formatDate = (value?: string): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US')
}

export default function SubscriptionDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id || ''

  const {
    data: subscription,
    isLoading,
    isError,
  } = useGetSubscriptionByIdQuery(id, { skip: !id })
  const [updateSubscription, { isLoading: isUpdating }] =
    useUpdateSubscriptionMutation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !subscription) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/subscriptions')}>
          <ChevronLeft className="size-4" />
          Back to subscriptions
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load subscription details.
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.SUBSCRIPTIONS_VIEW}>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/subscriptions')}>
          <ChevronLeft className="size-4" />
          Back to subscriptions
        </Button>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">
              Subscription {subscription.id}
            </h1>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={async () => {
                try {
                  await updateSubscription({
                    id: subscription.id,
                    body: { autoRenew: !subscription.autoRenew },
                  }).unwrap()
                  toast.success('Auto-renew updated successfully')
                } catch {
                  toast.error('Failed to update subscription')
                }
              }}
            >
              {subscription.autoRenew
                ? 'Disable Auto-renew'
                : 'Enable Auto-renew'}
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <p>
              <span className="font-medium">Member:</span>{' '}
              {subscription.memberId}
            </p>
            <p>
              <span className="font-medium">Plan:</span> {subscription.planId}
            </p>
            <p>
              <span className="font-medium">Status:</span> {subscription.status}
            </p>
            <p>
              <span className="font-medium">Started:</span>{' '}
              {formatDate(subscription.startDate)}
            </p>
            <p>
              <span className="font-medium">Ends:</span>{' '}
              {formatDate(subscription.endDate)}
            </p>
            <p>
              <span className="font-medium">Auto-renew:</span>{' '}
              {subscription.autoRenew ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          {subscription.cancellationReason ? (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Cancellation Reason</p>
              <p className="mt-1 text-muted-foreground">
                {subscription.cancellationReason}
              </p>
            </div>
          ) : null}
        </article>
      </div>
    </PermissionGuard>
  )
}
