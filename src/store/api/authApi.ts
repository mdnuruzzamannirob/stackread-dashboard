import { baseApi } from '../baseApi'

export interface StaffProfile {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
}

export interface StaffMeResponse {
  staff: StaffProfile
  permissions: string[]
}

export interface LoginStaffResponse {
  mustSetup2FA?: boolean
  requiresTwoFactor?: boolean
  tempToken?: string
  token?: string
  staff?: StaffProfile
}

export interface SetupTwoFactorResponse {
  qrCodeUrl: string
  secret: string
}

export interface AuthSuccessResponse {
  token: string
  staff: StaffProfile
}

export interface AcceptInviteResponse {
  mustSetup2FA: true
  tempToken: string
}

export const staffAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffMe: builder.query<StaffMeResponse, void>({
      query: () => '/staff/me',
      providesTags: ['Staff'],
    }),
    loginStaff: builder.mutation<
      LoginStaffResponse,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: '/staff/login',
        method: 'POST',
        body,
      }),
    }),
    setup2FA: builder.mutation<SetupTwoFactorResponse, string>({
      query: (tempToken) => ({
        url: '/staff/2fa/setup',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }),
    }),
    enable2FA: builder.mutation<
      AuthSuccessResponse,
      { tempToken: string; otp: string }
    >({
      query: ({ tempToken, otp }) => ({
        url: '/staff/2fa/enable',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
        body: { otp },
      }),
    }),
    verify2FA: builder.mutation<
      AuthSuccessResponse,
      { tempToken: string; otp: string }
    >({
      query: ({ tempToken, otp }) => ({
        url: '/staff/2fa/verify',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
        body: { otp },
      }),
    }),
    acceptInvite: builder.mutation<
      AcceptInviteResponse,
      { token: string; password: string; name: string }
    >({
      query: (body) => ({
        url: '/staff/accept-invite',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetStaffMeQuery,
  useLazyGetStaffMeQuery,
  useLoginStaffMutation,
  useSetup2FAMutation,
  useEnable2FAMutation,
  useVerify2FAMutation,
  useAcceptInviteMutation,
} = staffAuthApi
