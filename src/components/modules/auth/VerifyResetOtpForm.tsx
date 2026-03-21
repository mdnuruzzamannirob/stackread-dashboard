'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { OTPInput } from '@/components/common/OTPInput'
import { Button } from '@/components/ui/button'
import {
  verifyResetOtpSchema,
  type VerifyResetOtpSchema,
} from '@/lib/validations/auth'
import {
  useResendStaffResetOtpMutation,
  useVerifyStaffResetOtpMutation,
} from '@/store/api/authApi'

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

export function VerifyResetOtpForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [verifyResetOtp, { isLoading }] = useVerifyStaffResetOtpMutation()
  const [resendResetOtp, { isLoading: isResending }] =
    useResendStaffResetOtpMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerifyResetOtpSchema>({
    resolver: zodResolver(verifyResetOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: '',
    },
  })

  const emailValue = watch('email')
  const otpValue = watch('otp')

  const onSubmit = async (values: VerifyResetOtpSchema) => {
    setSubmitError(null)

    try {
      const response = await verifyResetOtp(values).unwrap()
      router.push(
        `/${locale}/reset-password?token=${encodeURIComponent(response.resetToken)}`,
      )
    } catch (error) {
      setSubmitError(getErrorMessage(error, t('invalidResetOtp')))
    }
  }

  const onResend = async () => {
    setSubmitError(null)
    setSuccessMessage(null)

    if (!emailValue) {
      setSubmitError(t('invalidCredentials'))
      return
    }

    try {
      await resendResetOtp(emailValue).unwrap()
      setSuccessMessage(t('resetOtpResent'))
    } catch (error) {
      setSubmitError(getErrorMessage(error, t('resetOtpResendFailed')))
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
          {t('verifyResetOtpTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('verifyResetOtpDesc')}
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
            <label htmlFor="otp" className="text-sm font-medium">
              {t('enterCode')}
            </label>
            <OTPInput
              id="otp"
              value={otpValue}
              onChange={(value) => setValue('otp', value)}
              placeholder={t('otpPlaceholder')}
              disabled={isLoading}
            />
            {errors.otp?.message ? (
              <p className="text-sm text-destructive">{errors.otp.message}</p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
          {successMessage ? (
            <p className="text-sm text-green-600">{successMessage}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('verifying') : t('verifyResetOtp')}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isResending}
            onClick={onResend}
            className="h-10 w-full"
          >
            {isResending ? t('sendingResetCode') : t('resendResetCode')}
          </Button>

          <Link
            href={`/${locale}/login`}
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
          >
            {t('backToLogin')}
          </Link>
        </form>
      </div>
    </motion.div>
  )
}
