'use client'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/hooks'
import {
  CreateFlashSaleRequest,
  FlashSale,
  useCreateFlashSaleMutation,
  useDeleteFlashSaleMutation,
  useListFlashSalesQuery,
  useToggleFlashSaleMutation,
  useUpdateFlashSaleMutation,
} from '@/store/api/promotionsApi'
import { useState } from 'react'
import { toast } from 'sonner'

type FlashSaleFormState = {
  title: string
  description: string
  discountPercentage: string
  startsAt: string
  endsAt: string
  isActive: boolean
}

const initialForm: FlashSaleFormState = {
  title: '',
  description: '',
  discountPercentage: '10',
  startsAt: '',
  endsAt: '',
  isActive: true,
}

export function FlashSalesList() {
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canManagePromotions = hasPermission(
    permissions,
    PERMISSIONS.PROMOTIONS_MANAGE,
  )
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null)
  const [deletingSale, setDeletingSale] = useState<FlashSale | null>(null)
  const [formState, setFormState] = useState<FlashSaleFormState>(initialForm)

  const { data, isLoading, isError, refetch } = useListFlashSalesQuery({
    page,
    limit: 20,
  })
  const [createFlashSale, { isLoading: isCreating }] =
    useCreateFlashSaleMutation()
  const [updateFlashSale, { isLoading: isUpdating }] =
    useUpdateFlashSaleMutation()
  const [toggleFlashSale, { isLoading: isToggling }] =
    useToggleFlashSaleMutation()
  const [deleteFlashSale, { isLoading: isDeleting }] =
    useDeleteFlashSaleMutation()

  const isProcessing = isCreating || isUpdating || isToggling || isDeleting

  const toPayload = (state: FlashSaleFormState): CreateFlashSaleRequest => ({
    title: state.title.trim(),
    description: state.description.trim() || undefined,
    discountPercentage: Number(state.discountPercentage),
    applicablePlanIds: [],
    isActive: state.isActive,
    startsAt: new Date(state.startsAt || Date.now()).toISOString(),
    endsAt: new Date(state.endsAt || Date.now()).toISOString(),
  })

  const startCreate = () => {
    setEditingSale(null)
    setFormState(initialForm)
    setShowForm(true)
  }

  const startEdit = (sale: FlashSale) => {
    setEditingSale(sale)
    setFormState({
      title: sale.title,
      description: sale.description || '',
      discountPercentage: String(sale.discountPercentage),
      startsAt: new Date(sale.startsAt).toISOString().slice(0, 16),
      endsAt: new Date(sale.endsAt).toISOString().slice(0, 16),
      isActive: sale.isActive,
    })
    setShowForm(true)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formState.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      if (editingSale) {
        await updateFlashSale({
          id: editingSale.id,
          body: toPayload(formState),
        }).unwrap()
        toast.success('Flash sale updated successfully')
      } else {
        await createFlashSale(toPayload(formState)).unwrap()
        toast.success('Flash sale created successfully')
      }

      setShowForm(false)
      setEditingSale(null)
      setFormState(initialForm)
      refetch()
    } catch {
      toast.error('Failed to save flash sale')
    }
  }

  const columns: DataTableColumn<FlashSale>[] = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'discountPercentage',
      label: 'Discount',
      render: (value) => `${value}%`,
    },
    {
      key: 'startsAt',
      label: 'Starts',
      render: (value) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: 'endsAt',
      label: 'Ends',
      render: (value) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value, row) => (
        <button
          type="button"
          disabled={!canManagePromotions}
          onClick={() => toggleFlashSale(row.id)}
          className={
            value
              ? 'rounded bg-green-500/20 px-2 py-1 text-xs text-green-700 dark:text-green-400'
              : 'rounded bg-gray-500/20 px-2 py-1 text-xs text-gray-700 dark:text-gray-400'
          }
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Flash Sales"
          description="Manage promotional flash sale campaigns"
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Failed to load flash sales.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash Sales"
        description="Manage promotional flash sale campaigns"
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isProcessing}
        onAdd={canManagePromotions ? startCreate : undefined}
        onEdit={canManagePromotions ? startEdit : undefined}
        onDelete={canManagePromotions ? setDeletingSale : undefined}
        noDataMessage="No flash sales found"
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {editingSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <input
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                placeholder="Title"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Description"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formState.discountPercentage}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      discountPercentage: event.target.value,
                    }))
                  }
                  placeholder="Discount %"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  Active
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={formState.startsAt}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      startsAt: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={formState.endsAt}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      endsAt: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canManagePromotions || isProcessing}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                >
                  {editingSale ? 'Update Flash Sale' : 'Create Flash Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingSale && (
        <ConfirmDialog
          title="Delete flash sale"
          description={`Delete flash sale "${deletingSale.title}"? This action cannot be undone.`}
          isDangerous
          isLoading={isDeleting}
          onCancel={() => setDeletingSale(null)}
          onConfirm={async () => {
            try {
              await deleteFlashSale(deletingSale.id).unwrap()
              toast.success('Flash sale deleted successfully')
              setDeletingSale(null)
              refetch()
            } catch {
              toast.error('Failed to delete flash sale')
            }
          }}
        />
      )}
    </div>
  )
}
