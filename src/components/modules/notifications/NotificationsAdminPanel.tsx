'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useAppSelector } from '@/store/hooks'
import {
  useBulkSendNotificationsMutation,
  BulkSendRequest,
} from '@/store/api/notificationsApi'
import { useState } from 'react'
import { toast } from 'sonner'

export function NotificationsAdminPanel() {
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canManageNotifications = hasPermission(
    permissions,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
  )

  const [sendBulk, { isLoading: isSending }] =
    useBulkSendNotificationsMutation()
  const [formData, setFormData] = useState<BulkSendRequest>({
    userIds: [],
    type: 'default',
    title: '',
    body: '',
  })
  const [sentNotifications, setSentNotifications] = useState<
    Array<{ timestamp: string; sentCount: number; title: string }>
  >([])

  const handleSend = async () => {
    if (!formData.userIds.length) {
      toast.error('Please enter at least one user ID')
      return
    }
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.body.trim()) {
      toast.error('Body is required')
      return
    }

    try {
      const result = await sendBulk(formData).unwrap()
      toast.success(`Notifications sent to ${result.sentCount} user(s)`)
      setSentNotifications((prev) => [
        {
          timestamp: new Date().toISOString(),
          sentCount: result.sentCount,
          title: formData.title,
        },
        ...prev,
      ])
      setFormData({
        userIds: [],
        type: 'default',
        title: '',
        body: '',
      })
    } catch {
      toast.error('Failed to send notifications')
    }
  }

  const columns: DataTableColumn<(typeof sentNotifications)[0]>[] = [
    {
      header: 'Sent At',
      cell: (row) => new Date(row.timestamp).toLocaleString(),
    },
    { header: 'Title', cell: (row) => row.title },
    { header: 'Count', cell: (row) => row.sentCount },
  ]

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.NOTIFICATIONS_MANAGE}>
      <div className="space-y-6">
        <PageHeader
          title="Bulk Send Notifications"
          description="Send notifications to multiple users"
        />

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                User IDs (comma-separated)
              </label>
              <textarea
                value={formData.userIds.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    userIds: e.target.value
                      .split(',')
                      .map((id) => id.trim())
                      .filter(Boolean),
                  })
                }
                disabled={!canManageNotifications || isSending}
                rows={4}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="65f19a9a6f8f4a2b3c4d5e6f, ..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  disabled={!canManageNotifications || isSending}
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="alert">Alert</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={!canManageNotifications || isSending}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Body</label>
              <textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                disabled={!canManageNotifications || isSending}
                rows={4}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Notification message"
              />
            </div>

            <button
              type="button"
              disabled={isSending || !canManageNotifications}
              onClick={handleSend}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isSending ? 'Sending...' : 'Send Notifications'}
            </button>
          </div>
        </div>

        {sentNotifications.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">Recent Sends</h3>
            <DataTable
              columns={columns}
              data={sentNotifications}
              isLoading={false}
              noDataMessage="No notifications sent yet"
            />
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
