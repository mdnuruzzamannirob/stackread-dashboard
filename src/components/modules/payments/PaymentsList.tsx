'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Payment,
  useListPaymentsQuery,
  useRefundPaymentMutation,
} from '@/store/api/paymentsApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { PaymentDetailsDialog } from './PaymentDetailsDialog'

export function PaymentsList() {
  const t = useTranslations()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [gateway, setGateway] = useState<string | undefined>()
  const { data, isLoading, isError, refetch } = useListPaymentsQuery({
    page,
    limit: 20,
    status: status || undefined,
    gateway: gateway || undefined,
  })
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null)
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null)

  const handleRefund = async () => {
    if (!refundingPayment) {
      return
    }

    try {
      await refundPayment({
        id: refundingPayment._id,
        body: {
          reason: 'Refund requested from admin panel',
        },
      }).unwrap()
      toast.success('Payment refunded successfully')
      setRefundingPayment(null)
      refetch()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to refund payment. Please try again.'
      toast.error(errorMessage)
      console.error('Refund error:', error)
    }
  }

  const columns: DataTableColumn<Payment>[] = [
    {
      key: 'orderId',
      label: t('payments.orderId'),
      sortable: true,
      render: (value) => String(value || '—'),
    },
    {
      key: 'memberId',
      label: t('payments.memberId'),
      sortable: true,
    },
    {
      key: 'amount',
      label: t('payments.amount'),
      sortable: true,
      render: (value, row) => `${row.currency} ${value}`,
    },
    {
      key: 'gateway',
      label: t('payments.gateway'),
      sortable: true,
      render: (value) => String(value).toUpperCase(),
    },
    {
      key: 'purpose',
      label: t('payments.purpose'),
      sortable: true,
      render: (value) => String(value),
    },
    {
      key: 'status',
      label: t('payments.status'),
      sortable: true,
      render: (value) => {
        const statusMap: Record<string, string> = {
          pending: t('payments.statusPending'),
          completed: t('payments.statusCompleted'),
          failed: t('payments.statusFailed'),
          refunded: t('payments.statusRefunded'),
          cancelled: t('payments.statusCancelled'),
        }
        return statusMap[String(value)] || String(value)
      },
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('payments.title')}
          description={t('payments.description')}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{t('errors.serverError')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('payments.title')}
        description={t('payments.description')}
      />

      <div className="flex gap-2">
        <select
          value={status || ''}
          onChange={(e) => {
            setStatus(e.target.value || undefined)
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t('common.allStatuses')}</option>
          <option value="pending">{t('payments.statusPending')}</option>
          <option value="completed">{t('payments.statusCompleted')}</option>
          <option value="failed">{t('payments.statusFailed')}</option>
          <option value="refunded">{t('payments.statusRefunded')}</option>
          <option value="cancelled">{t('payments.statusCancelled')}</option>
        </select>

        <select
          value={gateway || ''}
          onChange={(e) => {
            setGateway(e.target.value || undefined)
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t('common.allGateways')}</option>
          <option value="paypal">PayPal</option>
          <option value="stripe">Stripe</option>
          <option value="sslcommerz">SSL Commerz</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isRefunding}
        onView={setViewingPayment}
        noDataMessage={t('payments.noPayments')}
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />

      {viewingPayment && (
        <PaymentDetailsDialog
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
          onRefund={() => {
            setViewingPayment(null)
            setRefundingPayment(viewingPayment)
          }}
        />
      )}

      {refundingPayment && (
        <ConfirmDialog
          title="Refund Payment"
          description={`Refund ${refundingPayment.currency} ${refundingPayment.amount} from payment ${refundingPayment.orderId}?`}
          isLoading={isRefunding}
          onCancel={() => {
            setRefundingPayment(null)
          }}
          onConfirm={handleRefund}
        />
      )}
    </div>
  )
}
