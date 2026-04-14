import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface ApiEnvelopeWithMeta<T, M> extends ApiEnvelope<T> {
  meta: M
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
}

export type ReportStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'

export type ReportType =
  | 'admin_overview'
  | 'revenue_summary'
  | 'popular_books'
  | 'reading_stats'
  | 'subscription_stats'

export interface ReportItem {
  id: string
  type: string
  format: string
  status: string
  createdAt?: string
  updatedAt?: string
  fileName?: string
  downloadUrl?: string
  [key: string]: unknown
}

export interface ReportsListResponse {
  data: ReportItem[]
  total: number
  page: number
  limit: number
}

export interface CreateReportRequest {
  type: ReportType
  format: 'json' | 'csv' | 'xlsx' | 'pdf'
  filters?: Record<string, unknown>
}

const mapReport = (report: any): ReportItem => ({
  ...report,
  id: report.id || report._id,
})

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<
      ReportsListResponse,
      {
        page?: number
        limit?: number
        status?: ReportStatus
        type?: ReportType
      }
    >({
      query: (params) => ({
        url: '/admin/reports',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...(params.status && { status: params.status }),
          ...(params.type && { type: params.type }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<any, PaginationMeta>,
      ) => {
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray((response.data as any)?.items)
            ? (response.data as any).items
            : []

        return {
          data: rawData.map(mapReport),
          total: Number(response.meta?.total ?? rawData.length ?? 0),
          page: Number(response.meta?.page ?? 1),
          limit: Number(response.meta?.limit ?? 20),
        }
      },
      providesTags: [{ type: 'Dashboard', id: 'REPORTS' }],
    }),

    createReport: builder.mutation<ReportItem, CreateReportRequest>({
      query: (body) => ({
        url: '/admin/reports',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>) =>
        mapReport(response.data),
      invalidatesTags: [{ type: 'Dashboard', id: 'REPORTS' }],
    }),

    processReports: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/admin/reports/process',
        method: 'POST',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Dashboard', id: 'REPORTS' }],
    }),

    getReportById: builder.query<ReportItem, string>({
      query: (reportId) => `/admin/reports/${reportId}`,
      transformResponse: (response: ApiEnvelope<any>) =>
        mapReport(response.data),
      providesTags: (result, error, reportId) => [
        { type: 'Dashboard', id: `REPORT-${reportId}` },
      ],
    }),
  }),
})

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useProcessReportsMutation,
  useGetReportByIdQuery,
} = reportsApi
