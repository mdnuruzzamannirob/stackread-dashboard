'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/lib/validations/auth'
import { useForgotStaffPasswordMutation } from '@/store/api/authApi'

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

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [forgotPassword, { isLoading }] = useForgotStaffPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordSchema) => {
    setSubmitError(null)

    try {
      await forgotPassword(values.email).unwrap()
      router.push(
        `/${locale}/verify-reset-otp?email=${encodeURIComponent(values.email)}`,
      )
    } catch (error) {
      setSubmitError(getErrorMessage(error, t('forgotPasswordFailed')))
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
          {t('forgotPasswordTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('forgotPasswordDesc')}
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

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('sendingResetCode') : t('sendResetCode')}
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
