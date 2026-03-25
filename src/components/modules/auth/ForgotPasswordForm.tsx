'use client'

import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

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
  const [formData, setFormData] = useState<ForgotPasswordSchema>({
    email: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [forgotPassword, { isLoading }] = useForgotStaffPasswordMutation()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    // Validate using schema
    const validation = forgotPasswordSchema.safeParse(formData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (typeof path === 'string') {
          errors[path] = issue.message
        }
      })
      setFieldErrors(errors)
      return
    }

    try {
      await forgotPassword(formData.email).unwrap()
      toast.success(t('resetCodeSent'))
      router.push(
        `/${locale}/verify-reset-otp?email=${encodeURIComponent(formData.email)}`,
      )
    } catch (error) {
      const message = getErrorMessage(error, t('forgotPasswordFailed'))
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
          {t('forgotPasswordTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('forgotPasswordDesc')}
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
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (fieldErrors.email) {
                  setFieldErrors((prev) => {
                    const updated = { ...prev }
                    delete updated.email
                    return updated
                  })
                }
              }}
            />
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
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
