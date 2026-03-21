'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/lib/validations/auth'
import { useResetStaffPasswordMutation } from '@/store/api/authApi'

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

export function ResetPasswordForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token') || ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [resetPassword, { isLoading }] = useResetStaffPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken,
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordSchema) => {
    setSubmitError(null)

    try {
      await resetPassword({
        resetToken: values.resetToken,
        newPassword: values.newPassword,
      }).unwrap()
      toast.success(t('resetPasswordSuccess'))
      router.push(`/${locale}/login`)
    } catch (error) {
      const message = getErrorMessage(error, t('resetPasswordFailed'))
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
          {t('resetPasswordTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('resetPasswordDesc')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input type="hidden" {...register('resetToken')} />

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium">
              {t('newPassword')}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('passwordPlaceholder')}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
                {...register('newPassword')}
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
            {errors.newPassword?.message ? (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('passwordPlaceholder')}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword ? t('hidePassword') : t('showPassword')
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword?.message ? (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('resettingPassword') : t('resetPassword')}
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
