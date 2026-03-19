'use client'

import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { logout } from '@/lib/redux/authSlice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LogoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Clear auth state and redirect to login
    dispatch(logout())
    const timer = setTimeout(() => {
      router.push('/en/auth/login')
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
