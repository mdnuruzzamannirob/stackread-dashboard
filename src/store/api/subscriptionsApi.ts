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

export interface Subscription {
  _id: string
  id: string
  memberId: string
  planId: string
  planName: string
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  autoRenew: boolean
  cancellationReason?: string
  cancelledAt?: string
  cancelledBy?: string
  renewalAttempts: number
  nextRenewalAttempt?: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionsListResponse {
  data: Subscription[]
  total: number
  page: number
  limit: number
}

export interface UpdateSubscriptionRequest {
  autoRenew?: boolean
  planId?: string
}

const mapSubscription = (sub: any): Subscription => ({
  _id: sub.id || sub._id,
  id: sub.id || sub._id,
  memberId: sub.memberId,
  planId: sub.planId,
  planName: sub.planName,
  status: sub.status,
  startDate: sub.startDate,
  endDate: sub.endDate,
  autoRenew: Boolean(sub.autoRenew),
  cancellationReason: sub.cancellationReason,
  cancelledAt: sub.cancelledAt,
  cancelledBy: sub.cancelledBy,
  renewalAttempts: sub.renewalAttempts || 0,
  nextRenewalAttempt: sub.nextRenewalAttempt,
  createdAt: sub.createdAt,
  updatedAt: sub.updatedAt,
})

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSubscriptions: builder.query<
      SubscriptionsListResponse,
      {
        page?: number
        limit?: number
        status?: string
        memberId?: string
      }
    >({
      query: (params) => ({
        url: '/subscriptions',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
          ...(params.memberId && { memberId: params.memberId }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<any[], PaginationMeta>,
      ): SubscriptionsListResponse => ({
        data: (response.data || []).map(mapSubscription),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Subscriptions', id: 'LIST' }],
    }),

    getSubscriptionById: builder.query<Subscription, string>({
      query: (id) => `/subscriptions/${id}`,
      transformResponse: (response: ApiEnvelope<any>): Subscription =>
        mapSubscription(response.data),
      providesTags: (result, error, id) => [{ type: 'Subscriptions', id }],
    }),

    updateSubscription: builder.mutation<
      Subscription,
      { id: string; body: UpdateSubscriptionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/subscriptions/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): Subscription =>
        mapSubscription(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscriptions', id },
        { type: 'Subscriptions', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useUpdateSubscriptionMutation,
} = subscriptionsApi
