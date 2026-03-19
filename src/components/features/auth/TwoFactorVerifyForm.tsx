'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { OTPInput } from '@/components/common/OTPInput'
import { Button } from '@/components/ui/button'
import {
  clearAuth,
  setCredentials,
  setPermissions,
} from '@/lib/redux/authSlice'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import {
  useLazyGetStaffMeQuery,
  useVerify2FAMutation,
} from '@/lib/redux/staffAuthApi'
import { verify2FASchema, type Verify2FASchema } from '@/lib/validations/auth'

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
  const [verify2FA, { isLoading }] = useVerify2FAMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Verify2FASchema>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    if (!tempToken) {
      router.replace(`/${locale}/auth/login`)
    }
  }, [locale, router, tempToken])

  const onSubmit = async (values: Verify2FASchema) => {
    if (!tempToken) {
      router.replace(`/${locale}/auth/login`)
      return
    }

    setSubmitError(null)

    try {
      const response = await verify2FA({
        tempToken,
        otp: values.otp,
      }).unwrap()

      dispatch(
        setCredentials({
          token: response.token,
          staff: response.staff,
        }),
      )

      const meResponse = await getStaffMe().unwrap()
      dispatch(setPermissions(meResponse.permissions || []))

      router.push(`/${locale}/dashboard`)
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
          {t('twoFactorVerify')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('twoFactorVerifyDesc')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <OTPInput
                id="otp"
                value={field.value}
                onChange={field.onChange}
                placeholder={t('otpPlaceholder')}
                disabled={isLoading}
              />
            )}
          />

          {errors.otp?.message ? (
            <p className="text-sm text-destructive">{errors.otp.message}</p>
          ) : null}
          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('verifying') : t('submitCode')}
          </Button>

          <Link
            href={`/${locale}/auth/login`}
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
