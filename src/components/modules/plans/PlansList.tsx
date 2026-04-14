'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import {
  CreatePlanRequest,
  Plan,
  useCreatePlanMutation,
  useGetPlansQuery,
  useTogglePlanMutation,
  useUpdatePlanMutation,
} from '@/store/api/plansApi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type PlanFormState = {
  code: string
  name: string
  description: string
  price: string
  currency: string
  durationDays: string
  maxDevices: string
  downloadEnabled: boolean
  accessLevel: 'free' | 'basic' | 'premium'
  features: string
  isFree: boolean
  isActive: boolean
  sortOrder: string
}

const initialForm: PlanFormState = {
  code: '',
  name: '',
  description: '',
  price: '0',
  currency: 'BDT',
  durationDays: '30',
  maxDevices: '1',
  downloadEnabled: true,
  accessLevel: 'basic',
  features: '',
  isFree: false,
  isActive: true,
  sortOrder: '0',
}

export function PlansList() {
  const router = useRouter()
  const [includeInactive, setIncludeInactive] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formState, setFormState] = useState<PlanFormState>(initialForm)

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetPlansQuery({
    includeInactive,
  })
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation()
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation()
  const [togglePlan, { isLoading: isToggling }] = useTogglePlanMutation()

  const isProcessing = isCreating || isUpdating || isToggling

  const toPayload = (state: PlanFormState): CreatePlanRequest => ({
    code: state.code.trim(),
    name: state.name.trim(),
    description: state.description.trim(),
    price: Number(state.price),
    currency: state.currency.trim() || 'BDT',
    durationDays: Number(state.durationDays),
    maxDevices: Number(state.maxDevices),
    downloadEnabled: state.downloadEnabled,
    accessLevel: state.accessLevel,
    features: state.features
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean),
    isFree: state.isFree,
    isActive: state.isActive,
    sortOrder: Number(state.sortOrder),
  })

  const startCreate = () => {
    setEditingPlan(null)
    setFormState(initialForm)
    setShowForm(true)
  }

  const startEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormState({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: String(plan.price),
      currency: plan.currency,
      durationDays: String(plan.durationDays),
      maxDevices: String(plan.maxDevices),
      downloadEnabled: plan.downloadEnabled,
      accessLevel: plan.accessLevel,
      features: plan.features.join(', '),
      isFree: plan.isFree,
      isActive: plan.isActive,
      sortOrder: String(plan.sortOrder),
    })
    setShowForm(true)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.code.trim() || !formState.name.trim()) {
      toast.error('Code and name are required')
      return
    }

    try {
      if (editingPlan) {
        await updatePlan({
          id: editingPlan.id,
          body: toPayload(formState),
        }).unwrap()
        toast.success('Plan updated successfully')
      } else {
        await createPlan(toPayload(formState)).unwrap()
        toast.success('Plan created successfully')
      }

      setShowForm(false)
      setEditingPlan(null)
      setFormState(initialForm)
      refetch()
    } catch {
      toast.error('Failed to save plan')
    }
  }

  const columns: DataTableColumn<Plan>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value, row) => `${row.currency} ${value}`,
    },
    {
      key: 'durationDays',
      label: 'Duration',
      render: (value) => `${value} days`,
    },
    { key: 'accessLevel', label: 'Access' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value, row) => (
        <button
          type="button"
          onClick={() => togglePlan(row.id)}
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
          title="Plans"
          description="Configure subscription plans and pricing"
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">Failed to load plans.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans"
        description="Configure subscription plans and pricing"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
          />
          Include inactive plans
        </label>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading || isProcessing}
        onAdd={startCreate}
        onEdit={startEdit}
        onView={(plan) => router.push(`/plans/${plan.id}`)}
        noDataMessage="No plans found"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      code: event.target.value,
                    }))
                  }
                  placeholder="Code"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Name"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                  placeholder="Price"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  value={formState.currency}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      currency: event.target.value,
                    }))
                  }
                  placeholder="Currency"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  value={formState.durationDays}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      durationDays: event.target.value,
                    }))
                  }
                  placeholder="Duration Days"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={formState.maxDevices}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      maxDevices: event.target.value,
                    }))
                  }
                  placeholder="Max Devices"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formState.accessLevel}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      accessLevel: event.target.value as
                        | 'free'
                        | 'basic'
                        | 'premium',
                    }))
                  }
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={formState.sortOrder}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      sortOrder: event.target.value,
                    }))
                  }
                  placeholder="Sort Order"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <input
                value={formState.features}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    features: event.target.value,
                  }))
                }
                placeholder="Features (comma separated)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.downloadEnabled}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        downloadEnabled: event.target.checked,
                      }))
                    }
                  />
                  Download enabled
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.isFree}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        isFree: event.target.checked,
                      }))
                    }
                  />
                  Free plan
                </label>
                <label className="inline-flex items-center gap-2">
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
