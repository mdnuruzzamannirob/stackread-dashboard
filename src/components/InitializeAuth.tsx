'use client'

import { useGetStaffMeQuery } from '@/store/api/authApi'
import { useAppDispatch } from '@/store/hooks'
import { clearAuth, setAuth } from '@/store/slice/authSlice'
import { getSessionTokenCookie } from '@/lib/auth/clientTokenStorage'
import { useEffect } from 'react'

export function InitializeAuth() {
  const dispatch = useAppDispatch()
  const { data: staffMe, isLoading, error } = useGetStaffMeQuery()

  useEffect(() => {
    if (isLoading) return

    if (error) {
      dispatch(clearAuth())
      return
    }

    if (staffMe) {
      const token = getSessionTokenCookie()
      if (token) {
        dispatch(
          setAuth({
            token,
            staff: staffMe.staff,
            permissions: staffMe.permissions,
            actorType: 'staff',
          }),
        )
      }
    }
  }, [staffMe, isLoading, error, dispatch])

  return null
}
