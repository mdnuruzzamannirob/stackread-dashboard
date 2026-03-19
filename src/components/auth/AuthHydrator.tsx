'use client'

import { jwtDecode } from 'jwt-decode'
import { useEffect } from 'react'

import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
  getSessionTokenCookie,
  getTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import {
  clearAuth,
  setCredentials,
  setHydrated,
  setPermissions,
  setTempAuth,
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
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  permissions: string[]
}

type AccessJwtPayload = {
  exp?: number
}

export function AuthHydrator() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      try {
        const { token: tempToken, mode } = getTempTokenStorage()

        if (tempToken && mode) {
          dispatch(
            setTempAuth({
              tempToken,
              mustSetup2FA: mode === 'setup',
              requiresTwoFactor: mode === 'verify',
            }),
          )
        }

        const token = getSessionTokenCookie()

        if (!token) {
          throw new Error('Session not available')
        }

        const decoded = jwtDecode<AccessJwtPayload>(token)
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp && decoded.exp <= now) {
          clearSessionTokenCookie()
          clearTempTokenStorage()
          throw new Error('Session expired')
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/staff/me`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          },
        )

        if (!response.ok) {
          throw new Error('Session not available')
        }

        const envelope = (await response.json()) as {
          data?: StaffMeResponse
        }
        const data = envelope.data

        if (!data) {
          throw new Error('Invalid profile response')
        }

        if (cancelled) {
          return
        }

        dispatch(
          setCredentials({
            token,
            staff: {
              id: data.id,
              email: data.email,
              name: data.name,
              role: data.role,
              avatar: data.avatar,
            },
          }),
        )
        dispatch(setPermissions(data.permissions || []))
      } catch {
        if (!cancelled) {
          clearSessionTokenCookie()
          clearTempTokenStorage()
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
