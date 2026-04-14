'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import {
  useGetPaymentByIdQuery,
  useRefundPaymentMutation,
} from '@/store/api/paymentsApi'
import { useAppSelector } from '@/store/store'
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

export default function PaymentDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id || ''

  const permissions = useAppSelector((state) => state.auth.permissions)
  const canRefund = hasPermission(permissions, PERMISSIONS.PAYMENTS_MANAGE)

  const {
    data: payment,
    isLoading,
    isError,
  } = useGetPaymentByIdQuery(id, {
    skip: !id,
  })
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !payment) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/payments')}>
          <ChevronLeft className="size-4" />
          Back to payments
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load payment details.
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.PAYMENTS_VIEW}>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/payments')}>
          <ChevronLeft className="size-4" />
          Back to payments
        </Button>

        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">
              {payment.currency} {payment.amount}
            </h1>
            {canRefund && payment.status === 'completed' ? (
              <Button
                variant="outline"
                disabled={isRefunding}
                onClick={async () => {
                  try {
                    await refundPayment({
                      id: payment.id,
                      body: { reason: 'Refund requested from admin dashboard' },
                    }).unwrap()
                    toast.success('Payment refunded successfully')
                  } catch {
                    toast.error('Failed to refund payment')
                  }
                }}
              >
                Refund Payment
              </Button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <p>
              <span className="font-medium">Payment ID:</span> {payment.id}
            </p>
            <p>
              <span className="font-medium">Member:</span> {payment.memberId}
            </p>
            <p>
              <span className="font-medium">Status:</span> {payment.status}
            </p>
            <p>
              <span className="font-medium">Gateway:</span> {payment.gateway}
            </p>
            <p>
              <span className="font-medium">Purpose:</span> {payment.purpose}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {formatDate(payment.createdAt)}
            </p>
            <p>
              <span className="font-medium">Transaction:</span>{' '}
              {payment.transactionId || '—'}
            </p>
            <p>
              <span className="font-medium">Order:</span>{' '}
              {payment.orderId || '—'}
            </p>
          </div>

          {payment.refundAmountTotal ? (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p>
                <span className="font-medium">Total Refunded:</span>{' '}
                {payment.currency} {payment.refundAmountTotal}
              </p>
            </div>
          ) : null}
        </article>
      </div>
    </PermissionGuard>
  )
}
