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

interface BackendCategory {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  booksCount: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
  booksCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
  parentId?: string
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  slug?: string
  description?: string
  parentId?: string
  sortOrder?: number
  isActive?: boolean
}

export interface CategoriesListResponse {
  data: Category[]
  total: number
  page: number
  limit: number
}

const mapCategory = (category: BackendCategory): Category => ({
  _id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  parentId: category.parentId,
  sortOrder: Number(category.sortOrder ?? 0),
  isActive: Boolean(category.isActive),
  booksCount: Number(category.booksCount ?? 0),
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
})

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      CategoriesListResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/categories',
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          ...(params.search && { search: params.search }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<BackendCategory[], PaginationMeta>,
      ): CategoriesListResponse => ({
        data: (response.data || []).map(mapCategory),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 50),
      }),
      providesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    getCategoryById: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: ApiEnvelope<BackendCategory>) =>
        mapCategory(response.data),
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendCategory>) =>
        mapCategory(response.data),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: string; body: UpdateCategoryRequest }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendCategory>) =>
        mapCategory(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Categories', id },
        { type: 'Categories', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi
