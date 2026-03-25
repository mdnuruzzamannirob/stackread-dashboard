'use client'

import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

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
  const [formData, setFormData] = useState<VerifyResetOtpSchema>({
    email: initialEmail,
    otp: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [verifyResetOtp, { isLoading }] = useVerifyStaffResetOtpMutation()
  const [resendResetOtp, { isLoading: isResending }] =
    useResendStaffResetOtpMutation()

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    const validation = verifyResetOtpSchema.safeParse(formData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || 'general'
        errors[path] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    try {
      const response = await verifyResetOtp(validation.data).unwrap()
      toast.success(t('resetOtpVerified'))
      router.push(
        `/${locale}/reset-password?token=${encodeURIComponent(response.resetToken)}`,
      )
    } catch (error) {
      const message = getErrorMessage(error, t('invalidResetOtp'))
      setSubmitError(message)
      toast.error(message)
    }
  }

  const onResend = async () => {
    setSubmitError(null)
    setSuccessMessage(null)

    if (!formData.email) {
      setSubmitError(t('invalidCredentials'))
      toast.error(t('invalidCredentials'))
      return
    }

    try {
      await resendResetOtp(formData.email).unwrap()
      setSuccessMessage(t('resetOtpResent'))
      toast.success(t('resetOtpResent'))
    } catch (error) {
      const message = getErrorMessage(error, t('resetOtpResendFailed'))
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
          {t('verifyResetOtpTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('verifyResetOtpDesc')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleFieldChange(e, 'email')}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="otp" className="text-sm font-medium">
              {t('enterCode')}
            </label>
            <OTPInput
              id="otp"
              value={formData.otp}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, otp: value }))
              }
              placeholder={t('otpPlaceholder')}
              disabled={isLoading}
            />
            {fieldErrors.otp ? (
              <p className="text-sm text-destructive">{fieldErrors.otp}</p>
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
