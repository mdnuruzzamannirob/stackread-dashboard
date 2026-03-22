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

interface BackendPublisher {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logoUrl?: string
  country?: string
  foundedYear?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Publisher {
  _id: string
  name: string
  slug: string
  description?: string
  website?: string
  logoUrl?: string
  country?: string
  foundedYear?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePublisherRequest {
  name: string
  description?: string
  website?: string
  logoUrl?: string
  country?: string
  foundedYear?: number
  isActive?: boolean
}

export interface UpdatePublisherRequest {
  name?: string
  description?: string
  website?: string
  logoUrl?: string
  country?: string
  foundedYear?: number
  isActive?: boolean
}

export interface PublishersListResponse {
  data: Publisher[]
  total: number
  page: number
  limit: number
}

const mapPublisher = (publisher: BackendPublisher): Publisher => ({
  _id: publisher.id,
  name: publisher.name,
  slug: publisher.slug,
  description: publisher.description,
  website: publisher.website,
  logoUrl: publisher.logoUrl,
  country: publisher.country,
  foundedYear: publisher.foundedYear,
  isActive: Boolean(publisher.isActive),
  createdAt: publisher.createdAt,
  updatedAt: publisher.updatedAt,
})

export const publishersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishers: builder.query<
      PublishersListResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/publishers',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<BackendPublisher[], PaginationMeta>,
      ): PublishersListResponse => ({
        data: (response.data || []).map(mapPublisher),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Publishers', id: 'LIST' }],
    }),

    getPublisherById: builder.query<Publisher, string>({
      query: (id) => `/publishers/${id}`,
      transformResponse: (response: ApiEnvelope<BackendPublisher>) =>
        mapPublisher(response.data),
      providesTags: (result, error, id) => [{ type: 'Publishers', id }],
    }),

    createPublisher: builder.mutation<Publisher, CreatePublisherRequest>({
      query: (body) => ({
        url: '/publishers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendPublisher>) =>
        mapPublisher(response.data),
      invalidatesTags: [{ type: 'Publishers', id: 'LIST' }],
    }),

    updatePublisher: builder.mutation<
      Publisher,
      { id: string; body: UpdatePublisherRequest }
    >({
      query: ({ id, body }) => ({
        url: `/publishers/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendPublisher>) =>
        mapPublisher(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Publishers', id },
        { type: 'Publishers', id: 'LIST' },
      ],
    }),

    deletePublisher: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/publishers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Publishers', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPublishersQuery,
  useGetPublisherByIdQuery,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
  useDeletePublisherMutation,
} = publishersApi
