'use client'

import { useEffect } from 'react'

import {
  clearAuth,
  setCredentials,
  setHydrated,
  setPermissions,
} from '@/lib/redux/authSlice'
import { useAppDispatch } from '@/lib/redux/hooks'

interface StaffProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
}

interface StaffMeResponse {
  staff: StaffProfile
  permissions: string[]
}

export function AuthHydrator() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/staff/me`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error('Session not available')
        }

        const data = (await response.json()) as StaffMeResponse

        if (cancelled) {
          return
        }

        dispatch(
          setCredentials({
            token: '',
            staff: data.staff,
          }),
        )
        dispatch(setPermissions(data.permissions || []))
      } catch {
        if (!cancelled) {
          dispatch(clearAuth())
        }
      } finally {
        if (!cancelled) {
          dispatch(setHydrated())
        }
      }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [dispatch])

  return null
}
