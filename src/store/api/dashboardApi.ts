import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface ApiEnvelopeWithMeta<T, M> extends ApiEnvelope<T> {
  meta: M
}

export interface DashboardStats {
  totalMembers: number
  totalBooks: number
  activeLoans: number
  activeSubscriptions: number
  totalRevenue: number
  memberGrowth: number
  bookAdditions: number
  loanTrend: number
  subscriptionGrowth: number
  revenueGrowth: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
}

export interface BorrowStats {
  total: number
  borrowed: number
  returned: number
  overdue: number
  cancelled: number
}

export interface ActivityLogItem {
  _id: string
  action: string
  actor: string
  target: string
  targetType: string
  timestamp: string
  details?: Record<string, string | number>
}

export interface AdminOverviewResponse {
  stats: DashboardStats
  revenueTrend: RevenueTrendPoint[]
  activityLog: ActivityLogItem[]
  popularBooks: Array<{
    title: string
    borrowCount: number
  }>
  borrowStats: BorrowStats
}

interface BackendAdminOverviewResponse {
  totals: {
    users: number
    activeSubscriptions: number
    revenue: number
  }
  popularBooks: Array<{
    bookId: string
    title: string
    borrowCount: number
  }>
  borrowStats: {
    total: number
    borrowed: number
    returned: number
    overdue: number
    cancelled: number
  }
}

interface BackendAuditLogItem {
  id: string
  action: string
  actorEmail?: string
  actorId: string
  description: string
  targetId?: string
  targetType?: string
  createdAt: string
  meta?: Record<string, string | number>
}

interface BackendAuditMeta {
  total: number
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query<
      AdminOverviewResponse,
      { period?: 'week' | 'month' | 'year' }
    >({
      query: (params) => ({
        url: '/admin/reports/admin-overview',
        params: {
          period: params.period || 'month',
        },
      }),
      transformResponse: (
        response: ApiEnvelope<BackendAdminOverviewResponse>,
      ): AdminOverviewResponse => ({
        stats: {
          totalMembers: Number(response.data.totals?.users ?? 0),
          totalBooks: Number(response.data.popularBooks?.length ?? 0),
          activeLoans: Number(
            (response.data.borrowStats?.borrowed ?? 0) +
              (response.data.borrowStats?.overdue ?? 0),
          ),
          activeSubscriptions: Number(
            response.data.totals?.activeSubscriptions ?? 0,
          ),
          totalRevenue: Number(response.data.totals?.revenue ?? 0),
          memberGrowth: 0,
          bookAdditions: 0,
          loanTrend: 0,
          subscriptionGrowth: 0,
          revenueGrowth: 0,
        },
        revenueTrend: [],
        activityLog: [],
        popularBooks: (response.data.popularBooks ?? []).map((book) => ({
          title: book.title,
          borrowCount: Number(book.borrowCount ?? 0),
        })),
        borrowStats: {
          total: Number(response.data.borrowStats?.total ?? 0),
          borrowed: Number(response.data.borrowStats?.borrowed ?? 0),
          returned: Number(response.data.borrowStats?.returned ?? 0),
          overdue: Number(response.data.borrowStats?.overdue ?? 0),
          cancelled: Number(response.data.borrowStats?.cancelled ?? 0),
        },
      }),
      providesTags: [{ type: 'Dashboard', id: 'OVERVIEW' }],
    }),

    getAuditLogs: builder.query<
      { data: ActivityLogItem[]; total: number },
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/admin/audit/logs',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<BackendAuditLogItem[], BackendAuditMeta>,
      ) => ({
        data: (response.data || []).map((item) => ({
          _id: item.id,
          action: item.action,
          actor: item.actorEmail || item.actorId,
          target: item.targetType || item.description,
          targetType: item.targetType || 'audit',
          timestamp: item.createdAt,
          details: item.meta,
        })),
        total: Number(response.meta?.total ?? 0),
      }),
      providesTags: [{ type: 'Audit', id: 'LOGS' }],
    }),
  }),
})

export const { useGetAdminOverviewQuery, useGetAuditLogsQuery } = dashboardApi
