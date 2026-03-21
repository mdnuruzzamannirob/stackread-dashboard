'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  clearTempTokenStorage,
  setSessionTokenCookie,
  setTempTokenStorage,
} from '@/lib/auth/clientTokenStorage'
import { loginSchema, type LoginSchema } from '@/lib/validations/auth'
import {
  LoginStaffResponse,
  useLazyGetStaffMeQuery,
  useLoginStaffMutation,
} from '@/store/api/authApi'
import { useAppDispatch } from '@/store/hooks'
import {
  setCredentials,
  setPermissions,
  setTempAuth,
} from '@/store/slice/authSlice'

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) {
      return data.message
    }
  }

  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: string }).message
    if (message) {
      return message
    }
  }

  return fallback
}

export function StaffLoginForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [loginStaff, { isLoading }] = useLoginStaffMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginSchema) => {
    setSubmitError(null)

    try {
      const response = (await loginStaff(
        values,
      ).unwrap()) as NonNullable<LoginStaffResponse>

      if (response.mustSetup2FA && response.tempToken) {
        setTempTokenStorage(response.tempToken, 'setup')
        dispatch(
          setTempAuth({
            tempToken: response.tempToken,
            mustSetup2FA: true,
          }),
        )
        router.push(`/${locale}/2fa-setup`)
        return
      }

      if (response.requiresTwoFactor && response.tempToken) {
        setTempTokenStorage(response.tempToken, 'verify')
        dispatch(
          setTempAuth({
            tempToken: response.tempToken,
            requiresTwoFactor: true,
          }),
        )
        router.push(`/${locale}/2fa-verify`)
        return
      }

      if (response.token && response.staff) {
        setSessionTokenCookie(response.token)
        clearTempTokenStorage()
        dispatch(
          setCredentials({
            token: response.token,
            staff: response.staff,
          }),
        )

        const meResponse = await getStaffMe().unwrap()
        dispatch(setPermissions(meResponse.permissions || []))

        router.push(`/${locale}/dashboard`)
        return
      }

      setSubmitError(t('invalidCredentials'))
    } catch (error) {
      setSubmitError(getErrorMessage(error, t('invalidCredentials')))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-lg">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('welcomeBack')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('signInToDashboard')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
              {...register('email')}
            />
            {errors.email?.message ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t('password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('passwordPlaceholder')}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={
                  showPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password?.message ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('signingIn') : t('login')}
          </Button>

          <Link
            href={`/${locale}/forgot-password`}
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </form>
      </div>
    </motion.div>
  )
}
