'use client'

import { useEffect } from 'react'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
  getSessionTokenCookie,
  getTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useGetStaffMeQuery } from '@/store/api/authApi'
import { useAppDispatch } from '@/store/hooks'
import {
  clearAuth,
  hydrateAuth,
  setAuth,
  setHydrated,
  setTempAuth,
} from '@/store/slice/authSlice'

export function AuthHydrator() {
  const dispatch = useAppDispatch()
  const sessionToken = getSessionTokenCookie()
  const { token: tempToken, mode } = getTempTokenStorage()
  const shouldSkipStaffMe = Boolean(tempToken && mode) && !sessionToken

  const { data, isLoading, error } = useGetStaffMeQuery(undefined, {
    skip: shouldSkipStaffMe,
  })

  // Set temp auth when in 2FA flow
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

  // Handle auth state hydration
  useEffect(() => {
    // In 2FA flow - skip staff me call
    if (shouldSkipStaffMe) {
      dispatch(setHydrated())
      return
    }

    // Still loading
    if (isLoading) {
      return
    }

    // API error - clear everything
    if (error) {
      clearSessionTokenCookie()
      clearTempTokenStorage()
      dispatch(clearAuth())
      dispatch(setHydrated())
      return
    }

    // Success - we have staff data
    if (data?.staff) {
      const activeToken = getSessionTokenCookie()

      if (activeToken) {
        dispatch(
          setAuth({
            token: activeToken,
            staff: data.staff,
            permissions: data.permissions || [],
            actorType: 'staff',
          }),
        )
      } else {
        dispatch(
          hydrateAuth({
            token: null,
            staff: data.staff,
            permissions: data.permissions || [],
            actorType: 'staff',
          }),
        )
      }

      dispatch(setHydrated())
    } else {
      // Query returned no staff payload; leave current auth untouched here.
      dispatch(setHydrated())
    }
  }, [data, dispatch, error, isLoading, shouldSkipStaffMe])

  return null
}
