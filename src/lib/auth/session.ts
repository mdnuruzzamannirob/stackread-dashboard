'use server'

import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

export interface SessionPayload {
  staffId: string
  actorType: 'staff' | 'super_admin'
  permissions: string[]
  mustSetup2FA?: boolean
  twoFactorEnabled?: boolean
  requiresTwoFactor?: boolean
  iat: number
  exp: number
}

export interface Session {
  staffId: string
  actorType: 'staff' | 'super_admin'
  permissions: string[]
  mustSetup2FA: boolean
  isExpired: boolean
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(
      process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'stackread_staff_session',
    )?.value

    if (!token) {
      return null
    }

    const payload: SessionPayload = jwtDecode(token)

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp < now
    const mustSetup2FA =
      payload.mustSetup2FA === true ||
      payload.requiresTwoFactor === true ||
      payload.twoFactorEnabled === false

    return {
      staffId: payload.staffId,
      actorType: payload.actorType,
      permissions: payload.permissions || [],
      mustSetup2FA,
      isExpired,
    }
  } catch (error) {
    console.error('Failed to decode session:', error)
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(
    process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'stackread_staff_session',
  )
}
