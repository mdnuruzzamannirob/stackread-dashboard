'use client'

import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { useGetAuditLogsQuery } from '@/store/api/auditApi'
import { useMemo, useState } from 'react'

export function AuditLogsTable() {
  const [page, setPage] = useState(1)
  const [actorType, setActorType] = useState('')
  const [module, setModule] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const query = useMemo(
    () => ({
      page,
      limit: 20,
      ...(actorType ? { actorType } : {}),
      ...(module ? { module } : {}),
      ...(action ? { action } : {}),
      ...(from ? { from: new Date(from).toISOString() } : {}),
      ...(to ? { to: new Date(to).toISOString() } : {}),
    }),
    [page, actorType, module, action, from, to],
  )

  const { data, isLoading, isError } = useGetAuditLogsQuery(query)

  const columns: DataTableColumn<any>[] = [
    { key: 'actorType', label: 'Actor Type' },
    {
      key: 'actorEmail',
      label: 'Actor',
      render: (value, row) => String(value || row.actorId || '—'),
    },
    { key: 'module', label: 'Module' },
    { key: 'action', label: 'Action' },
    { key: 'description', label: 'Description' },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(String(value)).toLocaleString('en-US'),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track staff activity and export filtered logs"
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <input
          value={actorType}
          onChange={(event) => {
            setActorType(event.target.value)
            setPage(1)
          }}
          placeholder="Actor Type"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={module}
          onChange={(event) => {
            setModule(event.target.value)
            setPage(1)
          }}
          placeholder="Module"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={action}
          onChange={(event) => {
            setAction(event.target.value)
            setPage(1)
          }}
          placeholder="Action"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(event) => {
            setTo(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <a
          href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/audit/logs/export?${new URLSearchParams(
            {
              ...(actorType ? { actorType } : {}),
              ...(module ? { module } : {}),
              ...(action ? { action } : {}),
              ...(from ? { from: new Date(from).toISOString() } : {}),
              ...(to ? { to: new Date(to).toISOString() } : {}),
              format: 'csv',
            },
          ).toString()}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
        >
          Export CSV
        </a>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load audit logs.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          noDataMessage="No audit logs found"
          page={page}
          onPageChange={setPage}
          total={data?.total || 0}
          pageSize={20}
        />
      )}
    </div>
  )
}
