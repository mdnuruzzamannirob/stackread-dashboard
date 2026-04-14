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

// Coupon Types
export interface Coupon {
  _id: string
  id: string
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  totalLimit?: number
  usedCount: number
  applicablePlanIds: string[]
  isActive: boolean
  startsAt?: string
  endsAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCouponRequest {
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  totalLimit?: number
  applicablePlanIds?: string[]
  isActive?: boolean
  startsAt?: string | Date
  endsAt?: string | Date
}

export type UpdateCouponRequest = Partial<CreateCouponRequest>

export interface CouponsListResponse {
  data: Coupon[]
  total: number
  page: number
  limit: number
}

// Flash Sale Types
export interface FlashSale {
  _id: string
  id: string
  title: string
  description?: string
  discountPercentage: number
  applicablePlanIds: string[]
  isActive: boolean
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
}

export interface CreateFlashSaleRequest {
  title: string
  description?: string
  discountPercentage: number
  applicablePlanIds: string[]
  isActive?: boolean
  startsAt: string | Date
  endsAt: string | Date
}

export type UpdateFlashSaleRequest = Partial<CreateFlashSaleRequest>

export interface FlashSalesListResponse {
  data: FlashSale[]
  total: number
  page: number
  limit: number
}

const mapCoupon = (coupon: any): Coupon => ({
  _id: coupon.id || coupon._id,
  id: coupon.id || coupon._id,
  code: coupon.code,
  title: coupon.title,
  description: coupon.description,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  maxDiscountAmount: coupon.maxDiscountAmount,
  minOrderAmount: coupon.minOrderAmount,
  totalLimit: coupon.totalLimit,
  usedCount: coupon.usedCount || 0,
  applicablePlanIds: Array.isArray(coupon.applicablePlanIds)
    ? coupon.applicablePlanIds
    : [],
  isActive: Boolean(coupon.isActive),
  startsAt: coupon.startsAt,
  endsAt: coupon.endsAt,
  createdAt: coupon.createdAt,
  updatedAt: coupon.updatedAt,
})

const mapFlashSale = (sale: any): FlashSale => ({
  _id: sale.id || sale._id,
  id: sale.id || sale._id,
  title: sale.title,
  description: sale.description,
  discountPercentage: Number(sale.discountPercentage ?? 0),
  applicablePlanIds: Array.isArray(sale.applicablePlanIds)
    ? sale.applicablePlanIds
    : [],
  isActive: Boolean(sale.isActive),
  startsAt: sale.startsAt,
  endsAt: sale.endsAt,
  createdAt: sale.createdAt,
  updatedAt: sale.updatedAt,
})

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Coupons
    listCoupons: builder.query<
      CouponsListResponse,
      {
        page?: number
        limit?: number
        isActive?: boolean
        search?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
      }
    >({
      query: (params) => ({
        url: '/coupons',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(typeof params.isActive === 'boolean' && {
            isActive: params.isActive,
          }),
          ...(params.search && { search: params.search }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<any[], PaginationMeta>,
      ): CouponsListResponse => ({
        data: (response.data || []).map(mapCoupon),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),

    getCouponById: builder.query<Coupon, string>({
      query: (id) => `/coupons/${id}`,
      transformResponse: (response: ApiEnvelope<any>): Coupon =>
        mapCoupon(response.data),
      providesTags: (result, error, id) => [{ type: 'Coupons', id }],
    }),

    createCoupon: builder.mutation<Coupon, CreateCouponRequest>({
      query: (body) => ({
        url: '/coupons',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): Coupon =>
        mapCoupon(response.data),
      invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),

    updateCoupon: builder.mutation<
      Coupon,
      { id: string; body: UpdateCouponRequest }
    >({
      query: ({ id, body }) => ({
        url: `/coupons/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): Coupon =>
        mapCoupon(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coupons', id },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),

    toggleCoupon: builder.mutation<Coupon, string>({
      query: (id) => ({
        url: `/coupons/${id}/toggle`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiEnvelope<any>): Coupon =>
        mapCoupon(response.data),
      invalidatesTags: (result, error, id) => [
        { type: 'Coupons', id },
        { type: 'Coupons', id: 'LIST' },
      ],
    }),

    deleteCoupon: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
    }),

    // Flash Sales
    listFlashSales: builder.query<
      FlashSalesListResponse,
      {
        page?: number
        limit?: number
        isActive?: boolean
        search?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
      }
    >({
      query: (params) => ({
        url: '/flash-sales',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(typeof params.isActive === 'boolean' && {
            isActive: params.isActive,
          }),
          ...(params.search && { search: params.search }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<any[], PaginationMeta>,
      ): FlashSalesListResponse => ({
        data: (response.data || []).map(mapFlashSale),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'FlashSales', id: 'LIST' }],
    }),

    createFlashSale: builder.mutation<FlashSale, CreateFlashSaleRequest>({
      query: (body) => ({
        url: '/flash-sales',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): FlashSale =>
        mapFlashSale(response.data),
      invalidatesTags: [{ type: 'FlashSales', id: 'LIST' }],
    }),

    updateFlashSale: builder.mutation<
      FlashSale,
      { id: string; body: UpdateFlashSaleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/flash-sales/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<any>): FlashSale =>
        mapFlashSale(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FlashSales', id },
        { type: 'FlashSales', id: 'LIST' },
      ],
    }),

    toggleFlashSale: builder.mutation<FlashSale, string>({
      query: (id) => ({
        url: `/flash-sales/${id}/toggle`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiEnvelope<any>): FlashSale =>
        mapFlashSale(response.data),
      invalidatesTags: (result, error, id) => [
        { type: 'FlashSales', id },
        { type: 'FlashSales', id: 'LIST' },
      ],
    }),

    deleteFlashSale: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/flash-sales/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'FlashSales', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useListCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useToggleCouponMutation,
  useDeleteCouponMutation,
  useListFlashSalesQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useToggleFlashSaleMutation,
  useDeleteFlashSaleMutation,
} = promotionsApi
