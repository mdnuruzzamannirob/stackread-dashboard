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

interface BackendAuthor {
  id: string
  name: string
  bio?: string
  countryCode?: string
  avatarUrl?: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Author {
  _id: string
  name: string
  bio?: string
  countryCode?: string
  avatarUrl?: string
  website?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAuthorRequest {
  name: string
  bio?: string
  countryCode?: string
  avatarUrl?: string
  website?: string
  isActive?: boolean
}

export interface UpdateAuthorRequest {
  name?: string
  bio?: string
  countryCode?: string
  avatarUrl?: string
  website?: string
  isActive?: boolean
}

export interface AuthorsListResponse {
  data: Author[]
  total: number
  page: number
  limit: number
}

const mapAuthor = (author: BackendAuthor): Author => ({
  _id: author.id,
  name: author.name,
  bio: author.bio,
  countryCode: author.countryCode,
  avatarUrl: author.avatarUrl,
  website: author.website,
  isActive: Boolean(author.isActive),
  createdAt: author.createdAt,
  updatedAt: author.updatedAt,
})

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
      transformResponse: (
        response: ApiEnvelopeWithMeta<BackendAuthor[], PaginationMeta>,
      ): AuthorsListResponse => ({
        data: (response.data || []).map(mapAuthor),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Authors', id: 'LIST' }],
    }),

    getAuthorById: builder.query<Author, string>({
      query: (id) => `/authors/${id}`,
      transformResponse: (response: ApiEnvelope<BackendAuthor>) =>
        mapAuthor(response.data),
      providesTags: (result, error, id) => [{ type: 'Authors', id }],
    }),

    createAuthor: builder.mutation<Author, CreateAuthorRequest>({
      query: (body) => ({
        url: '/authors',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendAuthor>) =>
        mapAuthor(response.data),
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
      transformResponse: (response: ApiEnvelope<BackendAuthor>) =>
        mapAuthor(response.data),
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
      transformResponse: () => ({ success: true }),
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
