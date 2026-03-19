import { baseApi } from '../baseApi'

export interface Category {
  _id: string
  name: string
  description?: string
  icon?: string
  parent?: string
  children?: string[]
  bookCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parent?: string
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  parent?: string
}

export interface CategoriesListResponse {
  data: Category[]
  total: number
  page: number
  limit: number
}

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
      providesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    getCategoryById: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
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
