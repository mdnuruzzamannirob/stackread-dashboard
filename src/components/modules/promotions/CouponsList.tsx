'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Coupon,
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useListCouponsQuery,
  useToggleCouponMutation,
  useUpdateCouponMutation,
} from '@/store/api/promotionsApi'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/hooks'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

type CouponFormState = {
  code: string
  title: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  totalLimit: string
  startsAt: string
  endsAt: string
  description: string
}

export function CouponsList() {
  const t = useTranslations()
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canManagePromotions = hasPermission(
    permissions,
    PERMISSIONS.PROMOTIONS_MANAGE,
  )
  const [page, setPage] = useState(1)
  const [isActive, setIsActive] = useState<boolean | undefined>()
  const { data, isLoading, isError, refetch } = useListCouponsQuery({
    page,
    limit: 20,
    isActive: isActive !== undefined ? isActive : undefined,
  })
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation()
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation()
  const [toggleCoupon, { isLoading: isToggling }] = useToggleCouponMutation()
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation()

  const [showDialog, setShowDialog] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [formState, setFormState] = useState<CouponFormState>({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 0,
    totalLimit: '',
    startsAt: '',
    endsAt: '',
    description: '',
  })

  const handleAdd = () => {
    setEditingCoupon(null)
    setFormState({
      code: '',
      title: '',
      discountType: 'percentage',
      discountValue: 0,
      totalLimit: '',
      startsAt: '',
      endsAt: '',
      description: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormState({
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      totalLimit: coupon.totalLimit ? String(coupon.totalLimit) : '',
      startsAt: coupon.startsAt
        ? new Date(coupon.startsAt).toISOString().slice(0, 16)
        : '',
      endsAt: coupon.endsAt
        ? new Date(coupon.endsAt).toISOString().slice(0, 16)
        : '',
      description: coupon.description || '',
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingCoupon(null)
    refetch()
  }

  const handleToggle = async (coupon: Coupon) => {
    try {
      await toggleCoupon(coupon._id).unwrap()
      toast.success(
        `Coupon "${coupon.code}" ${coupon.isActive ? 'disabled' : 'enabled'} successfully`,
      )
      refetch()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to toggle coupon. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async () => {
    if (!deletingCoupon) return

    try {
      await deleteCoupon(deletingCoupon._id).unwrap()
      toast.success(`Coupon "${deletingCoupon.code}" deleted successfully`)
      setDeletingCoupon(null)
      refetch()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to delete coupon. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleSubmitCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formState.code.trim()) {
      toast.error('Coupon code is required')
      return
    }

    if (!formState.discountValue || formState.discountValue <= 0) {
      toast.error('Discount value must be greater than 0')
      return
    }

    const payload = {
      code: formState.code.trim(),
      title: formState.title.trim() || formState.code.trim(),
      discountType: formState.discountType,
      discountValue: Number(formState.discountValue),
      ...(formState.totalLimit
        ? { totalLimit: Number(formState.totalLimit) }
        : {}),
      ...(formState.startsAt
        ? { startsAt: new Date(formState.startsAt).toISOString() }
        : {}),
      ...(formState.endsAt
        ? { endsAt: new Date(formState.endsAt).toISOString() }
        : {}),
      ...(formState.description.trim()
        ? { description: formState.description.trim() }
        : {}),
    }

    try {
      if (editingCoupon) {
        await updateCoupon({
          id: editingCoupon._id,
          body: payload,
        }).unwrap()
        toast.success('Coupon updated successfully')
      } else {
        await createCoupon(payload).unwrap()
        toast.success('Coupon created successfully')
      }

      handleCloseDialog()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to save coupon. Please try again.'
      toast.error(errorMessage)
    }
  }

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: 'code',
      label: t('coupons.code'),
      sortable: true,
      render: (value) => (
        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
          {value}
        </code>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'discountType',
      label: t('coupons.discountType'),
      render: (value) => (value === 'percentage' ? '%' : 'Fixed'),
    },
    {
      key: 'discountValue',
      label: t('coupons.discountValue'),
      render: (value, row) =>
        `${row.discountType === 'percentage' ? value + '%' : 'BDT ' + value}`,
    },
    {
      key: 'usedCount',
      label: t('coupons.used'),
      render: (value, row) => `${value}/${row.totalLimit || '∞'}`,
    },
    {
      key: 'endsAt',
      label: 'Ends',
      render: (value) =>
        value ? new Date(value as string).toLocaleDateString() : 'No end date',
    },
    {
      key: 'isActive',
      label: t('coupons.status'),
      render: (value, row) =>
        value ? (
          <button
            type="button"
            disabled={!canManagePromotions}
            onClick={() => handleToggle(row)}
            className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-700 hover:bg-green-500/30 dark:text-green-400"
          >
            Active
          </button>
        ) : (
          <button
            type="button"
            disabled={!canManagePromotions}
            onClick={() => handleToggle(row)}
            className="rounded bg-gray-500/20 px-2 py-1 text-xs text-gray-700 hover:bg-gray-500/30 dark:text-gray-400"
          >
            Inactive
          </button>
        ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('coupons.title')}
          description={t('coupons.description')}
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

  const isProcessing = isCreating || isUpdating || isToggling || isDeleting

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('coupons.title')}
        description={t('coupons.description')}
      />

      <div className="flex gap-2">
        <select
          value={isActive === undefined ? '' : isActive ? 'active' : 'inactive'}
          onChange={(e) => {
            if (e.target.value === '') setIsActive(undefined)
            else setIsActive(e.target.value === 'active')
            setPage(1)
          }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t('common.allStatuses')}</option>
          <option value="active">{t('coupons.statusActive')}</option>
          <option value="inactive">{t('coupons.statusInactive')}</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isProcessing}
        onAdd={canManagePromotions ? handleAdd : undefined}
        onEdit={canManagePromotions ? handleEdit : undefined}
        onDelete={canManagePromotions ? setDeletingCoupon : undefined}
        noDataMessage={t('coupons.noCoupons')}
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </h2>

            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Code</label>
                <input
                  value={formState.code}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <select
                    value={formState.discountType}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.discountValue}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        discountValue: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Total Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.totalLimit}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        totalLimit: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.startsAt}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        startsAt: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ends At
                </label>
                <input
                  type="datetime-local"
                  value={formState.endsAt}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      endsAt: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                  disabled={isProcessing || !canManagePromotions}
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCoupon && (
        <ConfirmDialog
          title="Delete coupon"
          description={`Delete coupon "${deletingCoupon.code}"? This action cannot be undone.`}
          confirmLabel={t('common.delete')}
          isDangerous
          isLoading={isDeleting}
          onCancel={() => setDeletingCoupon(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
