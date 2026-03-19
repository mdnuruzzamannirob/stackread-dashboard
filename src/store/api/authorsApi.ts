import { baseApi } from '../baseApi'

export interface Author {
  _id: string
  name: string
  bio?: string
  profileImage?: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAuthorRequest {
  name: string
  bio?: string
}

export interface UpdateAuthorRequest {
  name?: string
  bio?: string
}

export interface AuthorsListResponse {
  data: Author[]
  total: number
  page: number
  limit: number
}

export const authorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthors: builder.query<
      AuthorsListResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/authors',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
        },
      }),
      providesTags: [{ type: 'Authors', id: 'LIST' }],
    }),

    getAuthorById: builder.query<Author, string>({
      query: (id) => `/authors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Authors', id }],
    }),

    createAuthor: builder.mutation<Author, CreateAuthorRequest>({
      query: (body) => ({
        url: '/authors',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Authors', id: 'LIST' }],
    }),

    updateAuthor: builder.mutation<
      Author,
      { id: string; body: UpdateAuthorRequest }
    >({
      query: ({ id, body }) => ({
        url: `/authors/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Authors', id },
        { type: 'Authors', id: 'LIST' },
      ],
    }),

    deleteAuthor: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/authors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Authors', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetAuthorsQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorsApi
