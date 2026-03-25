'use client'

import { Payment } from '@/store/api/paymentsApi'
import { useTranslations } from 'next-intl'

interface PaymentDetailsDialogProps {
  payment: Payment
  onClose: () => void
  onRefund: () => void
}

export function PaymentDetailsDialog({
  payment,
  onClose,
  onRefund,
}: PaymentDetailsDialogProps) {
  const t = useTranslations()

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    completed: 'bg-green-500/20 text-green-700 dark:text-green-400',
    failed: 'bg-red-500/20 text-red-700 dark:text-red-400',
    refunded: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  }

  const statusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('payments.statusPending'),
      completed: t('payments.statusCompleted'),
      failed: t('payments.statusFailed'),
      refunded: t('payments.statusRefunded'),
      cancelled: t('payments.statusCancelled'),
    }
    return statusMap[status] || status
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {payment.currency} {payment.amount}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('payments.orderId')}: {payment.orderId || payment._id}
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
                  {t('payments.status')}:
                </span>
                <span
                  className={`rounded px-2 py-1 ${statusColors[payment.status]}`}
                >
                  {statusLabel(payment.status)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('payments.gateway')}:
                </span>
                <span>{payment.gateway.toUpperCase()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('payments.purpose')}:
                </span>
                <span>{payment.purpose}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('payments.memberId')}:
                </span>
                <span>{payment.memberId}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">
              {t('payments.transactionInfo')}
            </h3>
            <div className="space-y-3 text-sm">
              {payment.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('payments.transactionId')}:
                  </span>
                  <span className="break-all">{payment.transactionId}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('payments.createdAt')}:
                </span>
                <span>{new Date(payment.createdAt).toLocaleString()}</span>
              </div>

              {payment.refundAmountTotal && (
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">
                    {t('payments.refundedAmount')}:
                  </span>
                  <span>
                    {payment.currency} {payment.refundAmountTotal}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {payment.refunds && payment.refunds.length > 0 && (
          <div className="mb-6 rounded-lg border border-border/50 bg-muted/50 p-4">
            <h3 className="mb-3 font-semibold">{t('payments.refunds')}</h3>
            <div className="space-y-2">
              {payment.refunds.map((refund, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    Refund #{idx + 1}: {payment.currency} {refund.amount}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(refund.CreatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {payment.status === 'completed' && (
            <button
              onClick={onRefund}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-700 hover:bg-red-500/30 dark:text-red-400"
            >
              {t('payments.refund')}
            </button>
          )}
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
