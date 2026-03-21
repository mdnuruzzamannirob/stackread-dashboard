'use client'

import { useEffect } from 'react'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
  getSessionTokenCookie,
  getTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useGetStaffMeQuery } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearAuth,
  setAuth,
  setHydrated,
  setTempAuth,
} from '@/store/slice/authSlice'

export function AuthHydrator() {
  const dispatch = useAppDispatch()
  const sessionToken = getSessionTokenCookie()
  const tokenFromState = useAppSelector((state) => state.auth.token)
  const { token: tempToken, mode } = getTempTokenStorage()
  const shouldSkipStaffMe = Boolean(tempToken && mode) && !sessionToken

  const { data, isLoading, error } = useGetStaffMeQuery(undefined, {
    skip: shouldSkipStaffMe,
  })

  useEffect(() => {
    if (tempToken && mode) {
      dispatch(
        setTempAuth({
          tempToken,
          mustSetup2FA: mode === 'setup',
          requiresTwoFactor: mode === 'verify',
        }),
      )
    }
  }, [dispatch, mode, tempToken])

  useEffect(() => {
    if (shouldSkipStaffMe) {
      dispatch(setHydrated())
      return
    }

    if (isLoading) {
      return
    }

    if (error) {
      clearSessionTokenCookie()
      clearTempTokenStorage()
      dispatch(clearAuth())
      dispatch(setHydrated())
      return
    }

    if (data) {
      const activeToken = getSessionTokenCookie() ?? tokenFromState

      if (!activeToken) {
        dispatch(setHydrated())
        return
      }

      dispatch(
        setAuth({
          token: activeToken,
          staff: data.staff,
          permissions: data.permissions || [],
          actorType: 'staff',
        }),
      )
    }

    dispatch(setHydrated())
  }, [data, dispatch, error, isLoading, shouldSkipStaffMe, tokenFromState])

  return null
}
