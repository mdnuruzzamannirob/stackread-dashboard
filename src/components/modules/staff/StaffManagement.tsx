'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { useGetRbacRolesQuery } from '@/store/api/rbacApi'
import {
  useGetStaffListQuery,
  useInviteStaffMutation,
  useReinviteStaffMutation,
  useRemoveStaffMutation,
  useResetStaff2FAMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useUpdateStaffRoleMutation,
} from '@/store/api/staffApi'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export function StaffManagement() {
  const t = useTranslations()
  const { data: staffList = [], isLoading } = useGetStaffListQuery()
  const { data: roles = [] } = useGetRbacRolesQuery()

  const [inviteStaff, { isLoading: isInviting }] = useInviteStaffMutation()
  const [reinviteStaff] = useReinviteStaffMutation()
  const [updateStaffRole] = useUpdateStaffRoleMutation()
  const [suspendStaff] = useSuspendStaffMutation()
  const [unsuspendStaff] = useUnsuspendStaffMutation()
  const [resetStaff2FA] = useResetStaff2FAMutation()
  const [removeStaff] = useRemoveStaffMutation()

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRoleId, setInviteRoleId] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(7)
  const [phone, setPhone] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const roleMap = useMemo(
    () => new Map(roles.map((role) => [role.id, role.name])),
    [roles],
  )

  const handleInvite = async () => {
    setActionError(null)

    if (!inviteName || !inviteEmail || !inviteRoleId) {
      setActionError('Name, email and role are required.')
      return
    }

    try {
      await inviteStaff({
        name: inviteName,
        email: inviteEmail,
        roleId: inviteRoleId,
        phone: phone || undefined,
        expiresInDays,
      }).unwrap()

      setInviteName('')
      setInviteEmail('')
      setPhone('')
      setExpiresInDays(7)
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? ((error as { data?: { message?: string } }).data?.message ??
            'Failed to invite staff')
          : 'Failed to invite staff'
      setActionError(message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('navigation.staff')}
        description="Invite and manage staff accounts, access and 2FA state"
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Invite Staff</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            value={inviteName}
            onChange={(event) => setInviteName(event.target.value)}
            placeholder="Name"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <input
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="Email"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone (optional)"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <select
            value={inviteRoleId}
            onChange={(event) => setInviteRoleId(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Select role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={30}
            value={expiresInDays}
            onChange={(event) => setExpiresInDays(Number(event.target.value))}
            placeholder="Expiry days"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={handleInvite} disabled={isInviting}>
            {isInviting ? 'Inviting...' : 'Send Invite'}
          </Button>
          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">2FA</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  className="px-4 py-6 text-sm text-muted-foreground"
                  colSpan={6}
                >
                  {t('common.loading')}
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-sm text-muted-foreground"
                  colSpan={6}
                >
                  No staff found.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm">{staff.name}</td>
                  <td className="px-4 py-3 text-sm">{staff.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={staff.roleId || ''}
                        onChange={async (event) => {
                          const roleId = event.target.value
                          if (!roleId) {
                            return
                          }

                          try {
                            await updateStaffRole({
                              id: staff.id,
                              roleId,
                            }).unwrap()
                          } catch {
                            setActionError('Failed to update role')
                          }
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="">No role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-muted-foreground">
                        {staff.roleId
                          ? roleMap.get(staff.roleId)
                          : 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {staff.isActive ? 'Active' : 'Suspended'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {staff.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reinviteStaff(staff.id)}
                      >
                        Reinvite
                      </Button>
                      {staff.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suspendStaff(staff.id)}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unsuspendStaff(staff.id)}
                        >
                          Unsuspend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetStaff2FA(staff.id)}
                      >
                        Reset 2FA
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeStaff(staff.id)}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
