'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import {
  useGetGlobalSettingsQuery,
  useGetMaintenanceStateQuery,
  useUpdateGlobalSettingsMutation,
} from '@/store/api/settingsApi'
import { useAppSelector } from '@/store/hooks'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const t = useTranslations()
  const permissions = useAppSelector((state) => state.auth.permissions)
  const canManageSettings = hasPermission(
    permissions,
    PERMISSIONS.SETTINGS_MANAGE,
  )
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useGetGlobalSettingsQuery()
  const { data: maintenance } = useGetMaintenanceStateQuery()
  const [updateSettings, { isLoading: isSaving }] =
    useUpdateGlobalSettingsMutation()

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  const [paymentEnabled, setPaymentEnabled] = useState(false)
  const [paymentCurrency, setPaymentCurrency] = useState('BDT')

  useEffect(() => {
    if (maintenance) {
      setMaintenanceEnabled(Boolean(maintenance.enabled))
      setMaintenanceMessage(maintenance.message ?? '')
    }
  }, [maintenance])

  useEffect(() => {
    if (settings?.providers?.payment) {
      setPaymentEnabled(Boolean(settings.providers.payment.enabled))
      setPaymentCurrency(settings.providers.payment.currency ?? 'BDT')
    }
  }, [settings])

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.SETTINGS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={t('navigation.settings')}
          description={t('pages.settingsDescription')}
        />

        {isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              {t('errors.serverError')}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Maintenance</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Status: {maintenance?.enabled ? 'Enabled' : 'Disabled'}
              </p>
              {maintenance?.message ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Message: {maintenance.message}
                </p>
              ) : null}
              <div className="mt-4 space-y-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    disabled={!canManageSettings}
                    onChange={(event) =>
                      setMaintenanceEnabled(event.target.checked)
                    }
                  />
                  Enable maintenance mode
                </label>
                <textarea
                  value={maintenanceMessage}
                  disabled={!canManageSettings}
                  onChange={(event) =>
                    setMaintenanceMessage(event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Maintenance message"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Providers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Email:{' '}
                {settings?.providers.email.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Payment:{' '}
                {settings?.providers.payment.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <div className="mt-4 space-y-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={paymentEnabled}
                    disabled={!canManageSettings}
                    onChange={(event) =>
                      setPaymentEnabled(event.target.checked)
                    }
                  />
                  Enable payment provider
                </label>
                <input
                  value={paymentCurrency}
                  disabled={!canManageSettings}
                  onChange={(event) => setPaymentCurrency(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Currency"
                />

                <button
                  type="button"
                  disabled={isSaving || !canManageSettings}
                  onClick={async () => {
                    try {
                      await updateSettings({
                        providers: {
                          payment: {
                            enabled: paymentEnabled,
                            currency: paymentCurrency || 'BDT',
                          },
                        },
                        maintenance: {
                          enabled: maintenanceEnabled,
                          message: maintenanceMessage,
                        },
                      }).unwrap()
                      toast.success('Settings updated successfully')
                    } catch {
                      toast.error('Failed to update settings')
                    }
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
