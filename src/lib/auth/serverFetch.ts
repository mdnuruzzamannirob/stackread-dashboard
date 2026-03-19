'use server'

import { getSession } from './session'

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export async function serverFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  try {
    const session = await getSession()

    if (!session) {
      throw new Error('Unauthorized: No active session')
    }

    if (session.isExpired) {
      throw new Error('Unauthorized: Session expired')
    }

    const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_BASE_URL)

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${session.staffId}`)
    headers.set('Content-Type', 'application/json')

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid token or session expired')
      }
      if (response.status === 403) {
        throw new Error('Forbidden: Insufficient permissions')
      }
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Server fetch error:', error)
    throw error
  }
}
