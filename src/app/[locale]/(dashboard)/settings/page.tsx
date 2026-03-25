'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { PermissionGuard } from '@/components/common/PermissionGuard'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  useGetGlobalSettingsQuery,
  useGetMaintenanceStateQuery,
} from '@/store/api/settingsApi'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations()
  const {
    data: settings,
    isLoading,
    isError,
    refetch,
  } = useGetGlobalSettingsQuery()
  const { data: maintenance } = useGetMaintenanceStateQuery()

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
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  )
}
