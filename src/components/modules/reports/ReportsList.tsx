'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/hooks'
import {
  ReportItem,
  ReportStatus,
  ReportType,
  useCreateReportMutation,
  useGetReportsQuery,
  useProcessReportsMutation,
} from '@/store/api/reportsApi'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export function ReportsList() {
  const locale = useLocale()
  const router = useRouter()
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canManageReports = hasPermission(
    permissions,
    PERMISSIONS.REPORTS_MANAGE,
  )
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [type, setType] = useState<string>('')

  const { data, isLoading, isError, refetch } = useGetReportsQuery({
    page,
    limit: 20,
    ...(status ? { status: status as ReportStatus } : {}),
    ...(type ? { type: type as ReportType } : {}),
  })
  const [createReport, { isLoading: isCreating }] = useCreateReportMutation()
  const [processReports, { isLoading: isProcessingReports }] =
    useProcessReportsMutation()

  const isBusy = isCreating || isProcessingReports

  const reportTypeOptions = useMemo(
    () => [
      'admin_overview',
      'revenue_summary',
      'popular_books',
      'reading_stats',
      'subscription_stats',
    ],
    [],
  )

  const columns: DataTableColumn<ReportItem>[] = [
    {
      key: 'id',
      label: 'Report ID',
      render: (value) => <span className="text-xs">{String(value)}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => String(value || '—'),
    },
    {
      key: 'format',
      label: 'Format',
      sortable: true,
      render: (value) => String(value || '—').toUpperCase(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => String(value || 'unknown'),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) =>
        value ? new Date(String(value)).toLocaleString('en-US') : '—',
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Generate, process and download system reports"
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load reports.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate, process and download system reports"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All status</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {reportTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          disabled={isBusy || !canManageReports}
          onClick={async () => {
            try {
              await processReports().unwrap()
              toast.success('Report processor triggered')
              refetch()
            } catch {
              toast.error('Failed to process reports')
            }
          }}
        >
          Process Queue
        </Button>

        <Button
          type="button"
          disabled={isBusy || !canManageReports}
          onClick={async () => {
            try {
              await createReport({
                type: 'admin_overview',
                format: 'json',
                filters: {},
              }).unwrap()
              toast.success('Report generation requested')
              refetch()
            } catch {
              toast.error('Failed to create report')
            }
          }}
        >
          Generate Overview
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isBusy}
        onView={(report) => router.push(`/${locale}/reports/${report.id}`)}
        noDataMessage="No reports found"
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />
    </div>
  )
}
