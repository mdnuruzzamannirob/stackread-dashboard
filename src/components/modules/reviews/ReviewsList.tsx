'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/hooks'
import {
  useGetReviewsQuery,
  useToggleReviewVisibilityMutation,
  Review,
} from '@/store/api/reviewsApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

export function ReviewsList() {
  const t = useTranslations()
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canModerateReviews = hasPermission(
    permissions,
    PERMISSIONS.REVIEWS_MANAGE,
  )

  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ bookId: '', userId: '' })
  const [toggleReview, { isLoading: isToggling }] =
    useToggleReviewVisibilityMutation()

  const { data, isLoading } = useGetReviewsQuery({
    page,
    limit: 20,
    ...(filters.bookId && { bookId: filters.bookId }),
    ...(filters.userId && { userId: filters.userId }),
  })

  const handleToggleVisibility = async (review: Review) => {
    try {
      await toggleReview(review.id).unwrap()
      toast.success(
        `Review ${review.isVisible ? 'hidden' : 'shown'} successfully`,
      )
    } catch {
      toast.error('Failed to update review visibility')
    }
  }

  const columns: DataTableColumn<Review>[] = [
    {
      header: 'Rating',
      cell: (row) => `${row.rating}/5`,
      width: '80px',
    },
    {
      header: 'Title',
      cell: (row) => <span className="truncate">{row.title}</span>,
    },
    {
      header: 'Comment',
      cell: (row) => (
        <span className="truncate text-sm text-muted-foreground">
          {row.comment}
        </span>
      ),
    },
    {
      header: 'Visible',
      cell: (row) =>
        row.isVisible ? (
          <button
            type="button"
            disabled={!canModerateReviews || isToggling}
            onClick={() => handleToggleVisibility(row)}
            className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-700 hover:bg-green-500/30 dark:text-green-400 disabled:opacity-50"
          >
            Yes
          </button>
        ) : (
          <button
            type="button"
            disabled={!canModerateReviews || isToggling}
            onClick={() => handleToggleVisibility(row)}
            className="rounded bg-gray-500/20 px-2 py-1 text-xs text-gray-700 hover:bg-gray-500/30 dark:text-gray-400 disabled:opacity-50"
          >
            No
          </button>
        ),
    },
  ]

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.REVIEWS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={t('reviews.title')}
          description={t('reviews.description')}
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by Book ID"
            value={filters.bookId}
            onChange={(e) => {
              setFilters({ ...filters, bookId: e.target.value })
              setPage(1)
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Filter by User ID"
            value={filters.userId}
            onChange={(e) => {
              setFilters({ ...filters, userId: e.target.value })
              setPage(1)
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          noDataMessage={t('reviews.noReviews')}
          page={page}
          onPageChange={setPage}
          pageSize={20}
        />
      </div>
    </PermissionGuard>
  )
}
