import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface GlobalSettings {
  providers: {
    email: { from: string; enabled: boolean }
    push: { enabled: boolean }
    storage: { enabled: boolean; basePath: string }
    payment: { enabled: boolean; currency: string }
  }
  templates: {
    email: Record<string, string>
    push: Record<string, string>
  }
  maintenance: {
    enabled: boolean
    message: string
    startsAt?: string
    endsAt?: string
    allowedIps: string[]
  }
  trial: {
    enabled: boolean
    durationDays: number
    accessLevel: 'free' | 'basic'
    autoActivate: boolean
  }
}

export interface UpdateSettingsRequest {
  providers?: Partial<GlobalSettings['providers']>
  templates?: Partial<GlobalSettings['templates']>
  maintenance?: Partial<GlobalSettings['maintenance']>
  trial?: Partial<GlobalSettings['trial']>
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalSettings: builder.query<GlobalSettings, void>({
      query: () => '/admin/settings',
      transformResponse: (response: ApiEnvelope<GlobalSettings>) =>
        response.data,
      providesTags: [{ type: 'Dashboard', id: 'SETTINGS' }],
    }),
    getMaintenanceState: builder.query<GlobalSettings['maintenance'], void>({
      query: () => '/admin/settings/maintenance',
      transformResponse: (
        response: ApiEnvelope<GlobalSettings['maintenance']>,
      ) => response.data,
      providesTags: [{ type: 'Dashboard', id: 'SETTINGS_MAINTENANCE' }],
    }),
    updateGlobalSettings: builder.mutation<
      GlobalSettings,
      UpdateSettingsRequest
    >({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<GlobalSettings>) =>
        response.data,
      invalidatesTags: [
        { type: 'Dashboard', id: 'SETTINGS' },
        { type: 'Dashboard', id: 'SETTINGS_MAINTENANCE' },
      ],
    }),
  }),
})

export const {
  useGetGlobalSettingsQuery,
  useGetMaintenanceStateQuery,
  useUpdateGlobalSettingsMutation,
} = settingsApi
