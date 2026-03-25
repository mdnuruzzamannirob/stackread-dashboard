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

export interface Payment {
  _id: string
  id: string
  memberId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  gateway: 'paypal' | 'stripe' | 'sslcommerz'
  transactionId?: string
  orderId?: string
  planId?: string
  planName?: string
  purpose: 'subscription' | 'book-purchase' | 'donation'
  description?: string
  metadata?: Record<string, any>
  refundAmountTotal?: number
  refunds?: Array<{
    id: string
    amount: number
    status: string
    CreatedAt: string
  }>
  createdAt: string
  updatedAt: string
}

export interface PaymentsListResponse {
  data: Payment[]
  total: number
  page: number
  limit: number
}

export interface RefundRequest {
  amount?: number
  reason: string
}

const mapPayment = (payment: any): Payment => ({
  _id: payment.id || payment._id,
  id: payment.id || payment._id,
  memberId: payment.memberId,
  amount: payment.amount,
  currency: payment.currency || 'BDT',
  status: payment.status,
  gateway: payment.gateway,
  transactionId: payment.transactionId,
  orderId: payment.orderId,
  planId: payment.planId,
  planName: payment.planName,
  purpose: payment.purpose,
  description: payment.description,
  metadata: payment.metadata,
  refundAmountTotal: payment.refundAmountTotal,
  refunds: payment.refunds,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
})

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPayments: builder.query<
      PaymentsListResponse,
      {
        page?: number
        limit?: number
        status?: string
        gateway?: string
        memberId?: string
        startDate?: string
        endDate?: string
      }
    >({
      query: (params) => ({
        url: '/payments',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
          ...(params.gateway && { gateway: params.gateway }),
          ...(params.memberId && { memberId: params.memberId }),
          ...(params.startDate && { startDate: params.startDate }),
          ...(params.endDate && { endDate: params.endDate }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<any[], PaginationMeta>,
      ): PaymentsListResponse => ({
        data: (response.data || []).map(mapPayment),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Payments', id: 'LIST' }],
    }),

    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      transformResponse: (response: ApiEnvelope<any>): Payment =>
        mapPayment(response.data),
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),

    refundPayment: builder.mutation<
      Payment,
      { id: string; body: RefundRequest }
    >({
      query: ({ id, body }) => ({
        url: `/payments/${id}/refund`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): Payment =>
        mapPayment(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payments', id },
        { type: 'Payments', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListPaymentsQuery,
  useGetPaymentByIdQuery,
  useRefundPaymentMutation,
} = paymentsApi
