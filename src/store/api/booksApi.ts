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

export interface CoverImageRef {
  publicId: string
  url: string
  width: number
  height: number
}

// Exact backend BookFile structure
export interface BookFile {
  id: string
  provider: 'cloudinary'
  publicId: string
  url: string
  format: 'pdf' | 'epub' | 'mobi'
  size: number
  originalFileName: string
  resourceType: 'raw'
  uploadedAt: string
}

// Exact backend Book structure
export interface Book {
  _id: string
  id?: string
  title: string
  slug: string
  isbn?: string
  summary: string
  description?: string
  language: string
  pageCount?: number
  publicationDate?: string
  coverImage?: CoverImageRef
  edition?: string
  featured: boolean
  isAvailable: boolean
  accessLevel: 'free' | 'basic' | 'premium'
  isPublished: boolean
  authorIds: string[]
  categoryIds: string[]
  publisherId?: string
  tags: string[]
  files: BookFile[]
  ratingAverage: number
  ratingCount: number
  addedBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookRequest {
  title: string
  slug: string
  isbn?: string
  summary: string
  description?: string
  language: string
  pageCount?: number
  publicationDate?: Date | string
  coverImage?: CoverImageRef
  edition?: string
  featured?: boolean
  isAvailable?: boolean
  accessLevel?: 'free' | 'basic' | 'premium'
  isPublished?: boolean
  authorIds: string[]
  categoryIds: string[]
  tags?: string[]
  publisherId?: string
}

export type UpdateBookRequest = Partial<CreateBookRequest>

export interface BooksListResponse {
  data: Book[]
  total: number
  page: number
  limit: number
}

// Backend response structure
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
  coverImage?: {
    publicId: string
    url: string
    width: number
    height: number
  }
  edition?: string
  featured: boolean
  isAvailable: boolean
  accessLevel: 'free' | 'basic' | 'premium'
  isPublished: boolean
  authorIds: string[]
  categoryIds: string[]
  publisherId?: string
  tags: string[]
  files: BookFile[]
  ratingAverage: number
  ratingCount: number
  addedBy: string
  createdAt: string
  updatedAt: string
}

// Map backend response to frontend Book interface
const mapBook = (book: BackendBook): Book => ({
  _id: book.id,
  id: book.id,
  title: book.title,
  slug: book.slug,
  isbn: book.isbn || undefined,
  summary: book.summary,
  description: book.description || undefined,
  language: book.language,
  pageCount: book.pageCount || undefined,
  publicationDate: book.publicationDate || undefined,
  coverImage: book.coverImage || undefined,
  edition: book.edition || undefined,
  featured: Boolean(book.featured),
  isAvailable: Boolean(book.isAvailable),
  accessLevel: book.accessLevel || 'free',
  isPublished: Boolean(book.isPublished),
  authorIds: Array.isArray(book.authorIds) ? book.authorIds : [],
  categoryIds: Array.isArray(book.categoryIds) ? book.categoryIds : [],
  publisherId: book.publisherId || undefined,
  tags: Array.isArray(book.tags) ? book.tags : [],
  files: Array.isArray(book.files)
    ? book.files.map((f) => ({
        id: f.id,
        provider: f.provider,
        publicId: f.publicId,
        url: f.url,
        format: f.format,
        size: f.size,
        originalFileName: f.originalFileName,
        resourceType: f.resourceType,
        uploadedAt: f.uploadedAt,
      }))
    : [],
  ratingAverage: book.ratingAverage || 0,
  ratingCount: book.ratingCount || 0,
  addedBy: book.addedBy,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
})

export interface BulkImportRequest {
  books: CreateBookRequest[]
}

export type UploadBookFileBody =
  | {
      fileName: string
      contentType: string
      fileBase64: string
      folder?: string
      resourceType?: 'raw'
    }
  | {
      fileName: string
      contentType: string
      publicId: string
      url: string
      format: 'pdf' | 'epub' | 'mobi'
      size: number
      folder?: string
      resourceType?: 'raw'
    }

// File upload response from backend
export interface FileUploadResponse {
  id: string
  provider: 'cloudinary'
  publicId: string
  url: string
  format: 'pdf' | 'epub' | 'mobi'
  size: number
  originalFileName: string
  resourceType: 'raw'
  uploadedAt: string
}

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<
      BooksListResponse,
      {
        page?: number
        limit?: number
        search?: string
        featured?: boolean
        isAvailable?: boolean
        authorId?: string
        categoryId?: string
      }
    >({
      query: (params) => ({
        url: '/books',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
          ...(typeof params.featured === 'boolean' && {
            featured: params.featured,
          }),
          ...(typeof params.isAvailable === 'boolean' && {
            isAvailable: params.isAvailable,
          }),
          ...(params.authorId && { authorId: params.authorId }),
          ...(params.categoryId && { categoryId: params.categoryId }),
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
      { id: string; body: UploadBookFileBody }
    >({
      query: ({ id, body }) => ({
        url: `/admin/books/${id}/files`,
        method: 'POST',
        body,
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
        url: `/admin/books/${id}/availability`,
        method: 'PATCH',
        body: {
          availabilityStatus: available ? 'available' : 'unavailable',
        },
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
