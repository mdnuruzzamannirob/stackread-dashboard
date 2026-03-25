'use client'

import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { useEffect, useMemo, useState } from 'react'

import { OTPInput } from '@/components/common/OTPInput'
import { Button } from '@/components/ui/button'
import {
  clearTempTokenStorage,
  setSessionTokenCookie,
} from '@/lib/auth/clientTokenStorage'
import { enable2FASchema, type Enable2FASchema } from '@/lib/validations/auth'
import {
  useEnable2FAMutation,
  useLazyGetStaffMeQuery,
  useSetup2FAMutation,
} from '@/store/api/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCredentials, setPermissions } from '@/store/slice/authSlice'

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

export function TwoFactorSetupFlow() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const tempToken = useAppSelector((state) => state.auth.tempToken)

  const [step, setStep] = useState<'qr' | 'otp'>('qr')
  const [secret, setSecret] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Enable2FASchema>({
    otp: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [setup2FA, { isLoading: isSetupLoading }] = useSetup2FAMutation()
  const [enable2FA, { isLoading: isEnableLoading }] = useEnable2FAMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()

  useEffect(() => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    const runSetup = async () => {
      setSetupError(null)

      try {
        const setupResponse = await setup2FA(tempToken).unwrap()
        setSecret(setupResponse.secret)

        // Ensure proper URL encoding for QR code
        const qrCodeUrl = setupResponse.qrCodeUrl || ''
        if (!qrCodeUrl) {
          throw new Error('QR code URL not received from server')
        }

        const dataUrl = await QRCode.toDataURL(qrCodeUrl, {
          margin: 1,
          width: 220,
          errorCorrectionLevel: 'H',
        })
        setQrCodeImage(dataUrl)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : getErrorMessage(error, t('invalidCredentials'))
        setSetupError(message)
      }
    }

    void runSetup()
  }, [tempToken, router, locale, t, setup2FA])

  const canContinue = useMemo(
    () => Boolean(qrCodeImage && secret),
    [qrCodeImage, secret],
  )

  const onEnable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    setSetupError(null)
    setFieldErrors({})

    const validation = enable2FASchema.safeParse(formData)
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
      const response = await enable2FA({
        tempToken,
        otp: validation.data.otp,
      }).unwrap()

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

      router.push(`/${locale}/dashboard`)
    } catch (error) {
      setSetupError(getErrorMessage(error, t('invalidCredentials')))
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
          {t('twoFactorSetup')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('twoFactorSetupDesc')}
        </p>

        {step === 'qr' ? (
          <div className="mt-6 space-y-4">
            {isSetupLoading ? (
              <p className="text-sm text-muted-foreground">
                {tCommon('loading')}
              </p>
            ) : null}

            {qrCodeImage ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground text-center">
                  {t('scanQrCode')}
                </p>
                <Image
                  src={qrCodeImage}
                  alt="2FA QR code"
                  width={224}
                  height={224}
                  unoptimized
                  className="size-56 rounded-lg border border-border p-2"
                />

                <div className="w-full rounded-lg border border-border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('manualEntry')}
                  </p>
                  <p className="mt-1 break-all font-mono text-sm">{secret}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(secret)
                      setCopySuccess(true)
                      setTimeout(() => setCopySuccess(false), 1200)
                    }}
                    className="mt-2"
                  >
                    {copySuccess ? t('copied') : t('copySecret')}
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep('otp')}
                  disabled={!canContinue}
                  className="w-full h-10"
                >
                  {t('next')}
                </Button>
              </div>
            ) : null}

            {setupError ? (
              <p className="text-sm text-destructive">{setupError}</p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={onEnable} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">{t('enterOTP')}</p>
            <OTPInput
              id="otp"
              value={formData.otp}
              onChange={(value) => {
                setFormData({ otp: value })
                setFieldErrors({})
              }}
              placeholder={t('otpPlaceholder')}
              disabled={isEnableLoading}
            />

            {fieldErrors.otp ? (
              <p className="text-sm text-destructive">{fieldErrors.otp}</p>
            ) : null}
            {setupError ? (
              <p className="text-sm text-destructive">{setupError}</p>
            ) : null}

            <Button
              type="submit"
              disabled={isEnableLoading}
              className="h-10 w-full"
            >
              {isEnableLoading ? t('enabling') : t('confirmSetup')}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  )
}
