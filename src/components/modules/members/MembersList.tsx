'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { DataTable, DataTableColumn } from '@/components/common/DataTable'
import { useGetMembersQuery, MemberListItem } from '@/store/api/membersApi'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const getMemberName = (member: MemberListItem): string =>
  member.name || member.fullName || 'Unnamed member'

export function MembersList() {
  const t = useTranslations()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useGetMembersQuery({
    page,
    limit: 20,
    search: search || undefined,
  })

  const columns: DataTableColumn<MemberListItem>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_, row) => getMemberName(row),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => String(value || '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        if (row.isSuspended) {
          return 'Suspended'
        }

        return row.status || 'Active'
      },
    },
    {
      key: 'activeSubscription',
      label: 'Subscription',
      render: (_, row) => row.activeSubscription?.status || 'None',
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value) => {
        const date = value ? new Date(String(value)) : null
        return date && !Number.isNaN(date.getTime())
          ? date.toLocaleDateString('en-US')
          : '—'
      },
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t('navigation.members')}
          description="View and manage library members"
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{t('errors.serverError')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('navigation.members')}
        description="View and manage library members"
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        searchable
        searchPlaceholder={`${t('common.search')} members...`}
        noDataMessage="No members found."
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        page={page}
        onPageChange={setPage}
        total={data?.total || 0}
        pageSize={20}
        onView={(member) => router.push(`/members/${member.id}`)}
      />
    </div>
  )
}
