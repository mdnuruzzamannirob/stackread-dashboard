'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Subscription,
  useListSubscriptionsQuery,
} from '@/store/api/subscriptionsApi'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function SubscriptionsList() {
  const t = useTranslations()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const { data, isLoading, isError, refetch } = useListSubscriptionsQuery({
    page,
    limit: 20,
    status: status || undefined,
  })
  const columns: DataTableColumn<Subscription>[] = [
    {
      key: 'memberId',
      label: t('subscriptions.memberId'),
      sortable: true,
    },
    {
      key: 'planName',
      label: t('subscriptions.plan'),
      sortable: true,
    },
    {
      key: 'status',
      label: t('subscriptions.status'),
      sortable: true,
      render: (value) => {
        const statusMap: Record<string, string> = {
          active: t('subscriptions.statusActive'),
          expired: t('subscriptions.statusExpired'),
          cancelled: t('subscriptions.statusCancelled'),
        }
        return statusMap[value as string] || value
      },
    },
    {
      key: 'startDate',
      label: t('subscriptions.startDate'),
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: t('subscriptions.endDate'),
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'autoRenew',
      label: t('subscriptions.autoRenew'),
      render: (value) => (Boolean(value) ? '✓' : '–'),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('subscriptions.title')}
          description={t('subscriptions.description')}
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
        title={t('subscriptions.title')}
        description={t('subscriptions.description')}
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
          <option value="active">{t('subscriptions.statusActive')}</option>
          <option value="expired">{t('subscriptions.statusExpired')}</option>
          <option value="cancelled">
            {t('subscriptions.statusCancelled')}
          </option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onView={(subscription) =>
          router.push(`/subscriptions/${subscription.id}`)
        }
        noDataMessage={t('subscriptions.noSubscriptions')}
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />
    </div>
  )
}
