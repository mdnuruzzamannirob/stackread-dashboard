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

export interface BookFile {
  id: string
  provider: string
  key: string
  url: string
  contentType: string
  size: number
  originalFileName: string
  uploadedAt: string
}

export interface Book {
  _id: string
  title: string
  slug: string
  isbn: string
  summary: string
  authorIds: string[]
  categoryIds: string[]
  language: string
  publicationDate?: string
  coverImageUrl?: string
  pageCount?: number
  description?: string
  tags: string[]
  files: BookFile[]
  featured: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBookRequest {
  title: string
  slug: string
  isbn: string
  summary: string
  authorIds: string[]
  categoryIds: string[]
  language: string
  publicationDate?: string
  coverImageUrl?: string
  pageCount?: number
  description?: string
  featured?: boolean
  isAvailable?: boolean
  tags?: string[]
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

export interface BooksListResponse {
  data: Book[]
  total: number
  page: number
  limit: number
}

interface BackendBook {
  id: string
  title: string
  slug: string
  isbn?: string
  summary: string
  description?: string
  language: string
  pageCount?: number
  publicationDate?: string
  coverImageUrl?: string
  featured: boolean
  isAvailable: boolean
  authorIds: string[]
  categoryIds: string[]
  tags: string[]
  files: BookFile[]
  createdAt: string
  updatedAt: string
}

const mapBook = (book: BackendBook): Book => ({
  _id: book.id,
  title: book.title,
  slug: book.slug,
  isbn: book.isbn || '',
  summary: book.summary,
  description: book.description,
  language: book.language,
  pageCount: book.pageCount,
  publicationDate: book.publicationDate,
  coverImageUrl: book.coverImageUrl,
  featured: Boolean(book.featured),
  isAvailable: Boolean(book.isAvailable),
  authorIds: Array.isArray(book.authorIds) ? book.authorIds : [],
  categoryIds: Array.isArray(book.categoryIds) ? book.categoryIds : [],
  tags: Array.isArray(book.tags) ? book.tags : [],
  files: Array.isArray(book.files) ? book.files : [],
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
})

export interface BulkImportRequest {
  books: CreateBookRequest[]
}

export interface FileUploadResponse {
  id: string
  provider: string
  key: string
  url: string
  contentType: string
  size: number
  originalFileName: string
  uploadedAt: string
}

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<
      BooksListResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/books',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
        },
      }),
      transformResponse: (
        response: ApiEnvelopeWithMeta<BackendBook[], PaginationMeta>,
      ): BooksListResponse => ({
        data: (response.data || []).map(mapBook),
        total: Number(response.meta?.total ?? 0),
        page: Number(response.meta?.page ?? 1),
        limit: Number(response.meta?.limit ?? 10),
      }),
      providesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    getBookById: builder.query<Book, string>({
      query: (id) => `/books/${id}`,
      transformResponse: (response: ApiEnvelope<BackendBook>): Book =>
        mapBook(response.data),
      providesTags: (result, error, id) => [{ type: 'Books', id }],
    }),

    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (body) => ({
        url: '/admin/books',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<BackendBook>): Book =>
        mapBook(response.data),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    updateBook: builder.mutation<Book, { id: string; body: UpdateBookRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/admin/books/${id}`,
          method: 'PUT',
          body,
        }),
        transformResponse: (response: ApiEnvelope<BackendBook>): Book =>
          mapBook(response.data),
        invalidatesTags: (result, error, { id }) => [
          { type: 'Books', id },
          { type: 'Books', id: 'LIST' },
        ],
      },
    ),

    deleteBook: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/books/${id}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    uploadBookFile: builder.mutation<
      FileUploadResponse,
      {
        id: string
        body: {
          fileName: string
          contentType: string
          url: string
          key?: string
          size?: number
          provider?: string
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/books/${id}/files`,
        method: 'POST',
        body: {
          fileName: body.fileName,
          contentType: body.contentType,
          url: body.url,
          key: body.key ?? body.url,
          size: body.size ?? 1,
          provider: body.provider ?? 'external',
        },
      }),
      transformResponse: (response: ApiEnvelope<FileUploadResponse>) =>
        response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Books', id }],
    }),

    deleteBookFile: builder.mutation<
      { success: boolean },
      { id: string; fileId: string }
    >({
      query: ({ id, fileId }) => ({
        url: `/admin/books/${id}/files/${fileId}`,
        method: 'DELETE',
      }),
      transformResponse: () => ({ success: true }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Books', id }],
    }),

    toggleBookFeatured: builder.mutation<
      Book,
      { id: string; featured: boolean }
    >({
      query: ({ id, featured }) => ({
        url: `/admin/books/${id}/featured`,
        method: 'PATCH',
        body: { featured },
      }),
      transformResponse: (response: ApiEnvelope<BackendBook>): Book =>
        mapBook(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Books', id },
        { type: 'Books', id: 'LIST' },
      ],
    }),

    toggleBookAvailable: builder.mutation<
      Book,
      { id: string; available: boolean }
    >({
      query: ({ id, available }) => ({
        url: `/admin/books/${id}/available`,
        method: 'PATCH',
        body: { isAvailable: available },
      }),
      transformResponse: (response: ApiEnvelope<BackendBook>): Book =>
        mapBook(response.data),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Books', id },
        { type: 'Books', id: 'LIST' },
      ],
    }),

    bulkImportBooks: builder.mutation<
      { imported: number; failed: number },
      BulkImportRequest
    >({
      query: (body) => ({
        url: '/admin/books/bulk-import',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ApiEnvelope<{ successCount: number; failedCount: number }>,
      ) => ({
        imported: Number(response.data?.successCount ?? 0),
        failed: Number(response.data?.failedCount ?? 0),
      }),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useUploadBookFileMutation,
  useDeleteBookFileMutation,
  useToggleBookFeaturedMutation,
  useToggleBookAvailableMutation,
  useBulkImportBooksMutation,
} = booksApi
