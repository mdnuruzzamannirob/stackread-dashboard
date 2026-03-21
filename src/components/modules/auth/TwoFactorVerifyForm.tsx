'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { OTPInput } from '@/components/common/OTPInput'
import { Button } from '@/components/ui/button'
import {
  clearTempTokenStorage,
  setSessionTokenCookie,
} from '@/lib/auth/clientTokenStorage'
import { verify2FASchema, type Verify2FASchema } from '@/lib/validations/auth'
import {
  useLazyGetStaffMeQuery,
  useSendStaff2FAEmailOtpMutation,
  useVerify2FAMutation,
} from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearAuth,
  setCredentials,
  setPermissions,
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

export function TwoFactorVerifyForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const tempToken = useAppSelector((state) => state.auth.tempToken)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [method, setMethod] = useState<'totp' | 'email'>('totp')
  const [verify2FA, { isLoading }] = useVerify2FAMutation()
  const [sendEmailOtp, { isLoading: isSendingEmailOtp }] =
    useSendStaff2FAEmailOtpMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<Verify2FASchema>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      otp: '',
      emailOtp: '',
    },
  })

  const otpValue = watch('otp') || ''
  const emailOtpValue = watch('emailOtp') || ''

  useEffect(() => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
    }
  }, [locale, router, tempToken])

  const onSubmit = async (values: Verify2FASchema) => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    setSubmitError(null)

    try {
      const payload = {
        tempToken,
        ...(method === 'email' && emailOtpValue
          ? { emailOtp: emailOtpValue }
          : { otp: otpValue }),
      }

      const response = await verify2FA(payload as any).unwrap()

      setSessionTokenCookie(response.token)
      clearTempTokenStorage()

      dispatch(
        setCredentials({
          token: response.token,
          staff: response.staff as Parameters<
            typeof setCredentials
          >[0]['staff'],
        }),
      )

      const meResponse = await getStaffMe().unwrap()
      dispatch(setPermissions(meResponse.permissions || []))
      toast.success(t('twoFactorVerified'))

      router.push(`/${locale}/dashboard`)
    } catch (error) {
      const message = getErrorMessage(error, t('invalidCredentials'))
      setSubmitError(message)
      toast.error(message)
    }
  }

  const onSendEmailOtp = async () => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    setSubmitError(null)

    try {
      await sendEmailOtp(tempToken).unwrap()
      setMethod('email')
      reset()
      toast.success(t('twoFactorEmailOtpSent'))
    } catch (error) {
      const message = getErrorMessage(error, t('twoFactorEmailOtpSendFailed'))
      setSubmitError(message)
      toast.error(message)
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
          {t('twoFactorVerify')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {method === 'email'
            ? 'Enter the code sent to your email'
            : t('twoFactorVerifyDesc')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {method === 'totp' ? (
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <OTPInput
                  id="otp"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('otpPlaceholder')}
                  disabled={isLoading}
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name="emailOtp"
              render={({ field }) => (
                <OTPInput
                  id="emailOtp"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={t('otpPlaceholder')}
                  disabled={isLoading}
                />
              )}
            />
          )}

          {errors[method === 'email' ? 'emailOtp' : 'otp']?.message ? (
            <p className="text-sm text-destructive">
              {errors[method === 'email' ? 'emailOtp' : 'otp']?.message}
            </p>
          ) : null}
          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('verifying') : t('submitCode')}
          </Button>

          {method === 'totp' ? (
            <Button
              type="button"
              variant="outline"
              onClick={onSendEmailOtp}
              disabled={isSendingEmailOtp}
              className="h-10 w-full"
            >
              {isSendingEmailOtp
                ? t('sendingTwoFactorEmailOtp')
                : t('sendTwoFactorEmailOtp')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMethod('totp')
                reset()
              }}
              disabled={isLoading}
              className="h-10 w-full"
            >
              Use Authenticator App
            </Button>
          )}

          <Link
            href={`/${locale}/login`}
            onClick={() => dispatch(clearAuth())}
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </form>
      </div>
    </motion.div>
  )
}
