import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { RootState } from './store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState

    const token = state.auth.token

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
  credentials: 'include',
})

export const baseQueryWithReauth: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Token expired or invalid
    console.warn('[Auth] 401 Error - Token likely expired')

    // Clear all auth tokens and state
    clearSessionTokenCookie()
    clearTempTokenStorage()

    // Dispatch clearAuth action
    const dispatch = api.dispatch
    dispatch({ type: 'auth/clearAuth' })

    // Log for debugging
    console.warn('[Auth] Access denied - User session cleared')
  }

  if (result.error && result.error.status === 403) {
    // Access forbidden - insufficient permissions
    console.warn('[Auth] 403 Error - Insufficient permissions')
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Staff',
    'Members',
    'Books',
    'Authors',
    'Categories',
    'Borrows',
    'Reservations',
    'Payments',
    'Subscriptions',
    'Audit',
    'Dashboard',
  ],
  endpoints: () => ({}),
})
