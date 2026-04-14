import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface Plan {
  id: string
  code: string
  name: string
  description: string
  price: number
  currency: string
  durationDays: number
  maxDevices: number
  downloadEnabled: boolean
  accessLevel: 'free' | 'basic' | 'premium'
  features: string[]
  isFree: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePlanRequest {
  code: string
  name: string
  description: string
  price: number
  currency: string
  durationDays: number
  maxDevices: number
  downloadEnabled: boolean
  accessLevel: 'free' | 'basic' | 'premium'
  features: string[]
  isFree: boolean
  isActive: boolean
  sortOrder: number
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>

const mapPlan = (plan: Plan): Plan => ({
  ...plan,
  price: Number(plan.price ?? 0),
  durationDays: Number(plan.durationDays ?? 0),
  maxDevices: Number(plan.maxDevices ?? 0),
  sortOrder: Number(plan.sortOrder ?? 0),
  features: Array.isArray(plan.features) ? plan.features : [],
})

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<Plan[], { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: '/plans',
        params: {
          ...(params && typeof params.includeInactive === 'boolean'
            ? { includeInactive: params.includeInactive }
            : {}),
        },
      }),
      transformResponse: (response: ApiEnvelope<Plan[]>) =>
        (response.data ?? []).map(mapPlan),
      providesTags: [{ type: 'Dashboard', id: 'PLANS' }],
    }),

    getPlanById: builder.query<Plan, string>({
      query: (id) => `/plans/${id}`,
      transformResponse: (response: ApiEnvelope<Plan>) =>
        mapPlan(response.data),
      providesTags: (result, error, id) => [
        { type: 'Dashboard', id: `PLAN-${id}` },
      ],
    }),

    createPlan: builder.mutation<Plan, CreatePlanRequest>({
      query: (body) => ({
        url: '/plans',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<Plan>) =>
        mapPlan(response.data),
      invalidatesTags: [{ type: 'Dashboard', id: 'PLANS' }],
    }),

    updatePlan: builder.mutation<Plan, { id: string; body: UpdatePlanRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/plans/${id}`,
          method: 'PUT',
          body,
        }),
        transformResponse: (response: ApiEnvelope<Plan>) =>
          mapPlan(response.data),
        invalidatesTags: (result, error, { id }) => [
          { type: 'Dashboard', id: 'PLANS' },
          { type: 'Dashboard', id: `PLAN-${id}` },
        ],
      },
    ),

    togglePlan: builder.mutation<Plan, string>({
      query: (id) => ({
        url: `/plans/${id}/toggle`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiEnvelope<Plan>) =>
        mapPlan(response.data),
      invalidatesTags: (result, error, id) => [
        { type: 'Dashboard', id: 'PLANS' },
        { type: 'Dashboard', id: `PLAN-${id}` },
      ],
    }),
  }),
})

export const {
  useGetPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanMutation,
} = plansApi
