import { baseApi } from '../baseApi'

export interface DashboardStats {
  totalMembers: number
  totalBooks: number
  activeLoans: number
  totalRevenue: number
  memberGrowth: number
  bookAdditions: number
  loanTrend: number
  revenueGrowth: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
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
      providesTags: [{ type: 'Audit', id: 'LOGS' }],
    }),
  }),
})

export const { useGetAdminOverviewQuery, useGetAuditLogsQuery } = dashboardApi
