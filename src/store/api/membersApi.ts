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

export interface MemberListItem {
  id: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  avatar?: string
  isSuspended?: boolean
  status?: string
  activeSubscription?: {
    planId: string
    startedAt: string
    endsAt: string
    status: string
  } | null
  readingCount?: number
  paymentCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface MemberReadingHistoryItem {
  bookId: string
  title: string
  status: string
  startedAt: string
  completedAt: string | null
  userRating?: number | null
}

export interface MemberPaymentItem {
  id: string
  amount: number
  status: string
  transactionId: string
  currency: string
  createdAt: string
}

export interface MemberDetailResponse {
  member?: MemberListItem
  readingHistory: MemberReadingHistoryItem[]
  paymentHistory: MemberPaymentItem[]
  activeSubscription: {
    planId: string
    startedAt: string
    endsAt: string
    status: string
  } | null
}

export interface MembersListResponse {
  data: MemberListItem[]
  total: number
  page: number
  limit: number
}

type MemberActionResponse = { success: boolean }

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query<
      MembersListResponse,
      {
        page?: number
        limit?: number
        search?: string
        isSuspended?: boolean
      }
    >({
      query: (params) => ({
        url: '/admin/members',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...(params.search && { search: params.search }),
          ...(typeof params.isSuspended === 'boolean' && {
            isSuspended: params.isSuspended,
          }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<MemberListItem[], PaginationMeta>,
      ): MembersListResponse => ({
        data: Array.isArray(response.data) ? response.data : [],
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 20),
      }),
      providesTags: [{ type: 'Members', id: 'LIST' }],
    }),

    getMemberById: builder.query<MemberDetailResponse, string>({
      query: (userId) => `/admin/members/${userId}`,
      transformResponse: (response: ApiEnvelope<MemberDetailResponse>) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: 'Members', id: userId },
      ],
    }),

    getMemberReadingHistory: builder.query<MemberReadingHistoryItem[], string>({
      query: (userId) => `/admin/members/${userId}/reading-history`,
      transformResponse: (response: ApiEnvelope<MemberReadingHistoryItem[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: 'Members', id: `READING-${userId}` },
      ],
    }),

    getMemberPayments: builder.query<MemberPaymentItem[], string>({
      query: (userId) => `/admin/members/${userId}/payments`,
      transformResponse: (response: ApiEnvelope<MemberPaymentItem[]>) =>
        response.data ?? [],
      providesTags: (result, error, userId) => [
        { type: 'Members', id: `PAYMENTS-${userId}` },
      ],
    }),

    suspendMember: builder.mutation<MemberActionResponse, string>({
      query: (userId) => ({
        url: `/admin/members/${userId}/suspend`,
        method: 'PATCH',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Members', id: 'LIST' }],
    }),

    unsuspendMember: builder.mutation<MemberActionResponse, string>({
      query: (userId) => ({
        url: `/admin/members/${userId}/unsuspend`,
        method: 'PATCH',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Members', id: 'LIST' }],
    }),

    removeMember: builder.mutation<MemberActionResponse, string>({
      query: (userId) => ({
        url: `/admin/members/${userId}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Members', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useGetMemberReadingHistoryQuery,
  useGetMemberPaymentsQuery,
  useSuspendMemberMutation,
  useUnsuspendMemberMutation,
  useRemoveMemberMutation,
} = membersApi
