import { baseApi } from '../baseApi'

export interface Review {
  id: string
  userId: string
  bookId: string
  rating: number
  title: string
  comment: string
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewMetrics {
  ratingAverage: number
  ratingCount: number
}

export interface ReviewToggleResponse {
  review: Review
  metrics: ReviewMetrics
}

export interface ReviewListResponse {
  success: boolean
  message: string
  data: Review[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
  }
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<
      ReviewListResponse,
      {
        page?: number
        limit?: number
        bookId?: string
        userId?: string
        isVisible?: boolean
      }
    >({
      query: (params) => ({
        url: '/admin/reviews',
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    toggleReviewVisibility: builder.mutation<ReviewToggleResponse, string>({
      query: (id) => ({
        url: `/admin/reviews/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
})

export const { useGetReviewsQuery, useToggleReviewVisibilityMutation } =
  reviewsApi
