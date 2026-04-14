'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import { useGetRbacRolesQuery } from '@/store/api/rbacApi'
import {
  useGetStaffActivityQuery,
  useGetStaffByIdQuery,
  useReinviteStaffMutation,
  useRemoveStaffMutation,
  useResetStaff2FAMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useUpdateStaffRoleMutation,
} from '@/store/api/staffApi'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

const formatDate = (value?: string): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US')
}

export default function StaffDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const staffId = params?.id || ''

  const {
    data: staff,
    isLoading,
    isError,
  } = useGetStaffByIdQuery(staffId, {
    skip: !staffId,
  })
  const { data: activity = [] } = useGetStaffActivityQuery(staffId, {
    skip: !staffId,
  })
  const { data: roles = [] } = useGetRbacRolesQuery()

  const [reinviteStaff] = useReinviteStaffMutation()
  const [updateStaffRole] = useUpdateStaffRoleMutation()
  const [suspendStaff] = useSuspendStaffMutation()
  const [unsuspendStaff] = useUnsuspendStaffMutation()
  const [resetStaff2FA] = useResetStaff2FAMutation()
  const [removeStaff] = useRemoveStaffMutation()

  const roleMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !staff) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/staff')}>
          <ChevronLeft className="size-4" />
          Back to staff
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load staff details.
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await removeStaff(staffId).unwrap()
      toast.success('Staff removed successfully')
      router.push('/staff')
    } catch {
      toast.error('Failed to remove staff')
    }
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.STAFF_VIEW}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/staff')}>
            <ChevronLeft className="size-4" />
            Back to staff
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => reinviteStaff(staffId)}>
              Reinvite
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                staff.isActive ? suspendStaff(staffId) : unsuspendStaff(staffId)
              }
            >
              {staff.isActive ? 'Suspend' : 'Unsuspend'}
            </Button>
            <Button variant="outline" onClick={() => resetStaff2FA(staffId)}>
              Reset 2FA
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Email:</span> {staff.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {staff.phone || '—'}
              </p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                {staff.isActive ? 'Active' : 'Suspended'}
              </p>
              <p>
                <span className="font-medium">2FA:</span>{' '}
                {staff.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
              <p>
                <span className="font-medium">Role:</span>{' '}
                {staff.roleId ? roleMap.get(staff.roleId) : 'Unassigned'}
              </p>
              <p>
                <span className="font-medium">Joined:</span>{' '}
                {formatDate(staff.createdAt)}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                defaultValue={staff.roleId || ''}
                onChange={async (event) => {
                  const roleId = event.target.value
                  if (!roleId) {
                    return
                  }

                  try {
                    await updateStaffRole({ id: staffId, roleId }).unwrap()
                    toast.success('Staff role updated')
                  } catch {
                    toast.error('Failed to update staff role')
                  }
                }}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="">No role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <div className="mt-3 space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity found.
                </p>
              ) : (
                activity.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </p>
                    <p className="text-muted-foreground">
                      {entry.ipAddress || 'Unknown IP'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>
    </PermissionGuard>
  )
}
