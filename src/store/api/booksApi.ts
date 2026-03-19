import { baseApi } from '../baseApi'

export interface Book {
  _id: string
  title: string
  isbn: string
  authors: string[]
  category: string
  publisher?: string
  publishedYear?: number
  pageCount?: number
  description?: string
  coverUrl?: string
  totalCopies: number
  availableCopies: number
  featured: boolean
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBookRequest {
  title: string
  isbn: string
  authors: string[]
  category: string
  publisher?: string
  publishedYear?: number
  pageCount?: number
  description?: string
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

export interface BooksListResponse {
  data: Book[]
  total: number
  page: number
  limit: number
}

export interface BulkImportRequest {
  books: CreateBookRequest[]
}

export interface FileUploadResponse {
  fileId: string
  fileName: string
  url: string
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
      providesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    getBookById: builder.query<Book, string>({
      query: (id) => `/books/${id}`,
      providesTags: (result, error, id) => [{ type: 'Books', id }],
    }),

    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (body) => ({
        url: '/admin/books',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    updateBook: builder.mutation<Book, { id: string; body: UpdateBookRequest }>(
      {
        query: ({ id, body }) => ({
          url: `/admin/books/${id}`,
          method: 'PUT',
          body,
        }),
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
      invalidatesTags: [{ type: 'Books', id: 'LIST' }],
    }),

    uploadBookFile: builder.mutation<
      FileUploadResponse,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: `/admin/books/${id}/files`,
          method: 'POST',
          body: formData,
        }
      },
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
        body: { available },
      }),
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
