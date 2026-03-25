'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  acceptInviteSchema,
  type AcceptInviteSchema,
} from '@/lib/validations/auth'
import { useAcceptInviteMutation } from '@/store/api/authApi'

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

interface AcceptInviteFormProps {
  token: string
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [acceptInvite, { isLoading }] = useAcceptInviteMutation()

  const [formData, setFormData] = useState<AcceptInviteSchema>({
    token,
    password: '',
    confirmPassword: '',
  })

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof AcceptInviteSchema,
  ) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    // Validate using schema
    const validation = acceptInviteSchema.safeParse(formData)
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
      await acceptInvite({
        token: formData.token,
        password: formData.password,
      }).unwrap()
      toast.success(t('inviteActivated'))
      router.push(`/${locale}/login`)
    } catch (error) {
      const message = getErrorMessage(error, t('invalidCredentials'))
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
          {t('acceptInvite')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('acceptInviteDesc')}
        </p>
        <p className="mt-2 text-sm font-medium text-primary">
          {t('setupRequired')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="hidden" value={token} onChange={() => {}} />

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t('newPassword')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('passwordPlaceholder')}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
                value={formData.password}
                onChange={(e) => handleFieldChange(e, 'password')}
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
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
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
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange(e, 'confirmPassword')}
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
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-10 w-full">
            {isLoading ? t('acceptingInvite') : t('activateAccount')}
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
