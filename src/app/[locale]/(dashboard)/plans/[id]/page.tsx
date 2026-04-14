'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  useGetPlanByIdQuery,
  useTogglePlanMutation,
} from '@/store/api/plansApi'
import { ChevronLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id || ''

  const {
    data: plan,
    isLoading,
    isError,
  } = useGetPlanByIdQuery(id, {
    skip: !id,
  })
  const [togglePlan] = useTogglePlanMutation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/plans')}>
          <ChevronLeft className="size-4" />
          Back to plans
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load plan details.
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PLANS_MANAGE}>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/plans')}>
          <ChevronLeft className="size-4" />
          Back to plans
        </Button>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await togglePlan(plan.id).unwrap()
                  toast.success('Plan status updated')
                } catch {
                  toast.error('Failed to update plan status')
                }
              }}
            >
              {plan.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {plan.description}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <p>
              <span className="font-medium">Code:</span> {plan.code}
            </p>
            <p>
              <span className="font-medium">Price:</span> {plan.currency}{' '}
              {plan.price}
            </p>
            <p>
              <span className="font-medium">Duration:</span> {plan.durationDays}{' '}
              days
            </p>
            <p>
              <span className="font-medium">Max devices:</span>{' '}
              {plan.maxDevices}
            </p>
            <p>
              <span className="font-medium">Access:</span> {plan.accessLevel}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {plan.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium">Features</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {plan.features.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  No features defined
                </span>
              ) : (
                plan.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-border px-3 py-1 text-xs"
                  >
                    {feature}
                  </span>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </PermissionGuard>
  )
}
