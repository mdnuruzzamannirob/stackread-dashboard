'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { Button } from '@/components/ui/button'
import {
  useGetMemberByIdQuery,
  useGetMembersQuery,
  useGetMemberPaymentsQuery,
  useGetMemberReadingHistoryQuery,
  useRemoveMemberMutation,
  useSuspendMemberMutation,
  useUnsuspendMemberMutation,
} from '@/store/api/membersApi'
import { PERMISSIONS } from '@/lib/auth/permissions'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US')
}

export default function MemberDetailPage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()
  const userId = params?.userId || ''

  const { data: membersData } = useGetMembersQuery(
    { page: 1, limit: 100, search: userId },
    { skip: !userId },
  )
  const {
    data: memberDetail,
    isLoading,
    isError,
  } = useGetMemberByIdQuery(userId, { skip: !userId })
  const { data: readingHistoryData = [] } = useGetMemberReadingHistoryQuery(
    userId,
    { skip: !userId },
  )
  const { data: paymentHistoryData = [] } = useGetMemberPaymentsQuery(userId, {
    skip: !userId,
  })
  const [suspendMember] = useSuspendMemberMutation()
  const [unsuspendMember] = useUnsuspendMemberMutation()
  const [removeMember] = useRemoveMemberMutation()

  const member =
    memberDetail?.member || membersData?.data.find((item) => item.id === userId)

  if (isLoading && !memberDetail) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !member) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push('/members')}>
          <ChevronLeft className="size-4" />
          Back to members
        </Button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Unable to load member details.
        </div>
      </div>
    )
  }

  const readingHistory = memberDetail?.readingHistory ?? readingHistoryData
  const paymentHistory = memberDetail?.paymentHistory ?? paymentHistoryData

  const handleDelete = async () => {
    try {
      await removeMember(userId).unwrap()
      toast.success('Member deleted successfully')
      router.push('/members')
    } catch {
      toast.error('Failed to delete member')
    }
  }

  const handleSuspendToggle = async () => {
    try {
      if (member.isSuspended) {
        await unsuspendMember(userId).unwrap()
        toast.success('Member unsuspended')
      } else {
        await suspendMember(userId).unwrap()
        toast.success('Member suspended')
      }
    } catch {
      toast.error('Failed to update member status')
    }
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.MEMBERS_VIEW}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push('/members')}>
            <ChevronLeft className="size-4" />
            Back to members
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSuspendToggle}>
              {member.isSuspended ? 'Unsuspend' : 'Suspend'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Member
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              {member.name || member.fullName || 'Unnamed member'}
            </h1>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Email:</span>{' '}
                {member.email || '—'}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{' '}
                {member.phone || '—'}
              </p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                {member.isSuspended ? 'Suspended' : member.status || 'Active'}
              </p>
              <p>
                <span className="font-medium">Subscription:</span>{' '}
                {member.activeSubscription?.status || 'None'}
              </p>
              <p>
                <span className="font-medium">Joined:</span>{' '}
                {formatDate(member.createdAt)}
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active Subscription
            </p>
            {memberDetail?.activeSubscription ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Plan:</span>{' '}
                  {memberDetail.activeSubscription.planId}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  {memberDetail.activeSubscription.status}
                </p>
                <p>
                  <span className="font-medium">Started:</span>{' '}
                  {formatDate(memberDetail.activeSubscription.startedAt)}
                </p>
                <p>
                  <span className="font-medium">Ends:</span>{' '}
                  {formatDate(memberDetail.activeSubscription.endsAt)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No active subscription.
              </p>
            )}
          </article>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Reading History</h2>
            <div className="mt-3 space-y-3">
              {readingHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reading history found.
                </p>
              ) : (
                readingHistory.map((entry) => (
                  <div
                    key={`${entry.bookId}-${entry.startedAt}`}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-muted-foreground">
                      Status: {entry.status}
                    </p>
                    <p className="text-muted-foreground">
                      Started: {formatDate(entry.startedAt)}
                    </p>
                    <p className="text-muted-foreground">
                      Completed: {formatDate(entry.completedAt)}
                    </p>
                    {typeof entry.userRating === 'number' ? (
                      <p className="text-muted-foreground">
                        Rating: {entry.userRating}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">Payment History</h2>
            <div className="mt-3 space-y-3">
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payment history found.
                </p>
              ) : (
                paymentHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <p className="font-medium">
                      {entry.amount} {entry.currency}
                    </p>
                    <p className="text-muted-foreground">
                      Status: {entry.status}
                    </p>
                    <p className="text-muted-foreground">
                      Transaction: {entry.transactionId}
                    </p>
                    <p className="text-muted-foreground">
                      Created: {formatDate(entry.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </PermissionGuard>
  )
}
