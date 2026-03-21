'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  clearSessionTokenCookie,
  clearTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { useLogoutStaffMutation } from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearAuth } from '@/store/slice/authSlice'

export function DashboardTopbar() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const staff = useAppSelector((state) => state.auth.staff)

  const [logoutStaff, { isLoading }] = useLogoutStaffMutation()

  const handleLogout = useCallback(async () => {
    try {
      await logoutStaff().unwrap()
      toast.success(t('auth.logoutSuccess'))
    } catch (error) {
      console.error('Logout error:', error)
      toast.error(t('auth.logoutFailed'))
    } finally {
      clearSessionTokenCookie()
      clearTempTokenStorage()
      dispatch(clearAuth())
      router.replace(`/${locale}/login`)
    }
  }, [logoutStaff, dispatch, locale, router, t])

  return (
    <header className="fixed top-0 right-0 left-0 h-16 border-b border-border bg-background flex items-center justify-between px-6 z-50">
      <div className="text-xl font-bold">Stackread Admin</div>
      <div className="flex items-center gap-4">
        {staff ? (
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{staff.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{staff.role}</p>
          </div>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? t('auth.loggingOut') : t('auth.logout')}
        </Button>
      </div>
    </header>
  )
}
