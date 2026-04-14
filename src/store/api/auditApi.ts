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

export interface AuditLogItem {
  id: string
  actorType: string
  actorId: string
  actorEmail?: string
  action: string
  module: string
  description: string
  targetId?: string
  targetType?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  meta?: Record<string, unknown>
}

export interface AuditLogsResponse {
  data: AuditLogItem[]
  total: number
  page: number
  limit: number
}

export interface AuditLogQuery {
  page?: number
  limit?: number
  actorType?: string
  module?: string
  action?: string
  from?: string
  to?: string
}

const mapAuditLog = (item: any): AuditLogItem => ({
  id: item.id,
  actorType: item.actorType,
  actorId: item.actorId,
  actorEmail: item.actorEmail,
  action: item.action,
  module: item.module,
  description: item.description,
  targetId: item.targetId,
  targetType: item.targetType,
  requestId: item.requestId,
  ipAddress: item.ipAddress,
  userAgent: item.userAgent,
  createdAt: item.createdAt,
  meta: item.meta,
})

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogsResponse, AuditLogQuery | void>({
      query: (params) => ({
        url: '/admin/audit/logs',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          ...(params?.actorType && { actorType: params.actorType }),
          ...(params?.module && { module: params.module }),
          ...(params?.action && { action: params.action }),
          ...(params?.from && { from: params.from }),
          ...(params?.to && { to: params.to }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<AuditLogItem[], PaginationMeta>,
      ): AuditLogsResponse => ({
        data: (response.data || []).map(mapAuditLog),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 20),
      }),
      providesTags: [{ type: 'Audit', id: 'LOGS' }],
    }),
  }),
})

export const { useGetAuditLogsQuery } = auditApi
