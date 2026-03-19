'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

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

  const [setup2FA, { isLoading: isSetupLoading }] = useSetup2FAMutation()
  const [enable2FA, { isLoading: isEnableLoading }] = useEnable2FAMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Enable2FASchema>({
    resolver: zodResolver(enable2FASchema),
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    const runSetup = async () => {
      setSetupError(null)

      try {
        const setupEnvelope = await setup2FA(tempToken).unwrap()
        const setupResponse =
          'data' in setupEnvelope
            ? (setupEnvelope.data as { secret: string; qrCodeUrl: string })
            : (setupEnvelope as { secret: string; qrCodeUrl: string })
        setSecret(setupResponse.secret)
        const dataUrl = await QRCode.toDataURL(setupResponse.qrCodeUrl, {
          margin: 1,
          width: 220,
        })
        setQrCodeImage(dataUrl)
      } catch (error) {
        setSetupError(getErrorMessage(error, t('invalidCredentials')))
      }
    }

    void runSetup()
  }, [locale, router, setup2FA, t, tempToken])

  const canContinue = useMemo(
    () => Boolean(qrCodeImage && secret),
    [qrCodeImage, secret],
  )

  const onEnable = async (values: Enable2FASchema) => {
    if (!tempToken) {
      router.replace(`/${locale}/login`)
      return
    }

    setSetupError(null)

    try {
      const enableEnvelope = await enable2FA({
        tempToken,
        otp: values.otp,
      }).unwrap()
      const response =
        'data' in enableEnvelope
          ? (enableEnvelope.data as { token: string; staff: unknown })
          : (enableEnvelope as { token: string; staff: unknown })

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

      const meEnvelope = await getStaffMe().unwrap()
      const meResponse =
        'data' in meEnvelope
          ? (meEnvelope.data as { permissions?: string[] })
          : (meEnvelope as { permissions?: string[] })
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
          <form onSubmit={handleSubmit(onEnable)} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">{t('enterOTP')}</p>
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <OTPInput
                  id="otp"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('otpPlaceholder')}
                  disabled={isEnableLoading}
                />
              )}
            />

            {errors.otp?.message ? (
              <p className="text-sm text-destructive">{errors.otp.message}</p>
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
