'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import {
  useCreateRbacRoleMutation,
  useDeleteRbacRoleMutation,
  useGetRbacPermissionsQuery,
  useGetRbacRolesQuery,
  useUpdateRbacRoleMutation,
} from '@/store/api/rbacApi'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

export function RbacManagement() {
  const t = useTranslations()
  const { data: permissions = [] } = useGetRbacPermissionsQuery()
  const { data: roles = [], isLoading } = useGetRbacRolesQuery()

  const [createRole, { isLoading: isCreating }] = useCreateRbacRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateRbacRoleMutation()
  const [deleteRole] = useDeleteRbacRoleMutation()

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, typeof permissions>()

    permissions.forEach((permission) => {
      const existing = groups.get(permission.module) ?? []
      existing.push(permission)
      groups.set(permission.module, existing)
    })

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

  const resetForm = () => {
    setSelectedRoleId(null)
    setName('')
    setDescription('')
    setSelectedPermissions([])
    setFormError(null)
  }

  const onEditRole = (roleId: string) => {
    const role = roles.find((item) => item.id === roleId)
    if (!role) {
      return
    }

    setSelectedRoleId(role.id)
    setName(role.name)
    setDescription(role.description)
    setSelectedPermissions(role.permissions)
    setFormError(null)
  }

  const onTogglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((item) => item !== permissionKey)
        : [...prev, permissionKey],
    )
  }

  const onSubmitRole = async () => {
    setFormError(null)

    if (!name || !description || selectedPermissions.length === 0) {
      setFormError(
        'Name, description and at least one permission are required.',
      )
      return
    }

    try {
      if (selectedRoleId) {
        await updateRole({
          id: selectedRoleId,
          body: {
            name,
            description,
            permissions: selectedPermissions,
          },
        }).unwrap()
      } else {
        await createRole({
          name,
          description,
          permissions: selectedPermissions,
        }).unwrap()
      }

      resetForm()
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'data' in error
          ? ((error as { data?: { message?: string } }).data?.message ??
            'Failed to save role')
          : 'Failed to save role'
      setFormError(message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('navigation.rbac')}
        description="Manage roles and permission matrix"
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Role name"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Role description"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>

        <div className="mt-4 space-y-3">
          {groupedPermissions.map(([moduleName, modulePermissions]) => (
            <div
              key={moduleName}
              className="rounded-md border border-border p-3"
            >
              <h3 className="text-sm font-semibold capitalize">{moduleName}</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {modulePermissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.key)}
                      onChange={() => onTogglePermission(permission.key)}
                    />
                    <span>{permission.key}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formError ? (
          <p className="mt-3 text-sm text-destructive">{formError}</p>
        ) : null}

        <div className="mt-4 flex gap-3">
          <Button onClick={onSubmitRole} disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? 'Saving...'
              : selectedRoleId
                ? 'Update Role'
                : 'Create Role'}
          </Button>
          {selectedRoleId ? (
            <Button variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Permissions
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Type
              </th>
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
                  colSpan={5}
                >
                  {t('common.loading')}
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-sm text-muted-foreground"
                  colSpan={5}
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm font-medium">{role.name}</td>
                  <td className="px-4 py-3 text-sm">{role.description}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {role.permissions.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {role.isSystem ? 'System' : 'Custom'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditRole(role.id)}
                      >
                        Edit
                      </Button>
                      {!role.isSystem ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRole(role.id)}
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      ) : null}
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
