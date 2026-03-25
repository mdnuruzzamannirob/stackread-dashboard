'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { useListFlashSalesQuery } from '@/store/api/promotionsApi'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function FlashSalesPage() {
  const t = useTranslations()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useListFlashSalesQuery({
    page,
    limit: 20,
  })

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('flashSales.title')}
          description={t('flashSales.description')}
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
    <PermissionGuard requiredPermission={PERMISSIONS.PROMOTIONS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={t('flashSales.title')}
          description={t('flashSales.description')}
        />

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data && data.data.length > 0 ? (
              <div className="grid gap-4">
                {data.data.map((sale) => (
                  <div
                    key={sale._id}
                    className="rounded-lg border border-border p-4 hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{sale.title}</h3>
                        {sale.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {sale.description}
                          </p>
                        )}
                        <p className="mt-2 text-sm">
                          {sale.discountType === 'percentage'
                            ? `${sale.discountValue}% off`
                            : `BDT ${sale.discountValue} off`}
                          {sale.maxDiscountAmount && (
                            <span> (Max: BDT {sale.maxDiscountAmount})</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.startDate).toLocaleDateString()} to{' '}
                          {new Date(sale.endDate).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-xs">
                          {sale.isActive ? (
                            <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-700 dark:text-blue-400">
                              Active
                            </span>
                          ) : (
                            <span className="rounded bg-gray-500/20 px-2 py-1 text-gray-700 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">
                  {t('flashSales.noSales')}
                </p>
              </div>
            )}

            {data && data.total > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(data.total / 20)}
                </span>
                <button
                  disabled={page >= Math.ceil(data.total / 20)}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
