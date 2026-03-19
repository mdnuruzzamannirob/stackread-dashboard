'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slice/authSlice'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LogoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Clear auth state and redirect to login
    clearSessionTokenCookie()
    clearTempTokenStorage()
    dispatch(logout())
    const timer = setTimeout(() => {
      router.push('/en/login')
    }, 1000)

    return () => clearTimeout(timer)
  }, [dispatch, router, t])

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
    </div>
  )
}
