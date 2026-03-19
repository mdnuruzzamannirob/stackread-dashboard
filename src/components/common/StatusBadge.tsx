'use client'

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'failed'
  | 'completed'
  | 'processing'
  | 'expired'
  | 'cancelled'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig: Record<StatusType, { label: string; className: string }> =
    {
      active: {
        label: 'Active',
        className:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      inactive: {
        label: 'Inactive',
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      },
      pending: {
        label: 'Pending',
        className:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      },
      suspended: {
        label: 'Suspended',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      completed: {
        label: 'Completed',
        className:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      processing: {
        label: 'Processing',
        className:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      },
      expired: {
        label: 'Expired',
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      },
      cancelled: {
        label: 'Cancelled',
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      },
    }

  const config = statusConfig[status] || statusConfig.inactive
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  )
}
