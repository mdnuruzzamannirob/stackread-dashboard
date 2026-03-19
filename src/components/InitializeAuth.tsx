'use client'

import { hydrateAuth } from '@/lib/redux/authSlice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useEffect } from 'react'

export function InitializeAuth() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Hydrate auth from server session
    // This will be called after mount to initialize Redux state from session
    dispatch(
      hydrateAuth({
        token: null,
        staff: null,
        permissions: [],
        actorType: null,
      }),
    )
  }, [dispatch])

  return null
}
