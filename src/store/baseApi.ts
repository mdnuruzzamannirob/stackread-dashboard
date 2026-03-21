import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
  getSessionTokenCookie,
  setSessionTokenCookie,
} from '@/lib/auth/clientTokenStorage'
import { setToken } from './slice/authSlice'
import { RootState } from './store'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState

    // 1. Try to get token from Redux state first
    let token = state.auth.token

    // 2. If Redux state doesn't have token, read from cookie
    // This handles page reload case where Redux is not yet hydrated
    if (!token) {
      token = getSessionTokenCookie()
    }

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
  let result = await baseQuery(args, api, extraOptions)

  const shouldSkipRefresh =
    typeof args !== 'string' &&
    (args.url === '/staff/refresh' || args.url === '/staff/login')

  if (result.error && result.error.status === 401 && !shouldSkipRefresh) {
    const refreshResult = await baseQuery(
      {
        url: '/staff/refresh',
        method: 'POST',
      },
      api,
      extraOptions,
    )

    const refreshedAccessToken =
      refreshResult.data && typeof refreshResult.data === 'object'
        ? ((refreshResult.data as { data?: { accessToken?: string } }).data
            ?.accessToken ?? null)
        : null

    if (refreshedAccessToken) {
      setSessionTokenCookie(refreshedAccessToken)
      api.dispatch(setToken(refreshedAccessToken))
      result = await baseQuery(args, api, extraOptions)
    }
  }

  if (result.error && result.error.status === 401) {
    clearSessionTokenCookie()
    clearTempTokenStorage()

    api.dispatch({ type: 'auth/clearAuth' })

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
    'Rbac',
  ],
  endpoints: () => ({}),
})
