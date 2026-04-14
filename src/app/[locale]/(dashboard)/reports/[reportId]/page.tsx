'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useGetReportByIdQuery } from '@/store/api/reportsApi'
import { ChevronLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams<{ reportId: string }>()
  const reportId = params?.reportId || ''

  const {
    data: report,
    isLoading,
    isError,
  } = useGetReportByIdQuery(reportId, {
    skip: !reportId,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/reports')}>
          <ChevronLeft className="size-4" />
          Back to reports
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load report details.
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.REPORTS_VIEW}>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/reports')}>
          <ChevronLeft className="size-4" />
          Back to reports
        </Button>
        <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h1 className="text-2xl font-bold">Report {report.id}</h1>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <p>
              <span className="font-medium">Type:</span>{' '}
              {String(report.type || '—')}
            </p>
            <p>
              <span className="font-medium">Format:</span>{' '}
              {String(report.format || '—')}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {String(report.status || '—')}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {report.createdAt
                ? new Date(String(report.createdAt)).toLocaleString('en-US')
                : '—'}
            </p>
          </div>
          <div className="mt-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/reports/${report.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Download Report
            </a>
          </div>
        </article>
      </div>
    </PermissionGuard>
  )
}
