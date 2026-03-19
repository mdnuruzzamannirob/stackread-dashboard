'use client'

import { useAppDispatch } from '@/store/hooks'
import { hydrateAuth } from '@/store/slice/authSlice'
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
