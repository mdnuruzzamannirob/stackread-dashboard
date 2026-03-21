import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

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

interface BackendStaffMe {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  twoFactorEnabled: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  roleId?: string
  avatar?: string | null
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
  refreshToken?: string
  staff: StaffProfile
}

export interface AcceptInviteResponse {
  success: boolean
  message: string
}

interface StaffRefreshResponse {
  accessToken: string
}

interface StaffResetOtpVerifyResponse {
  resetToken: string
}

interface StaffActionStatusResponse {
  sent?: boolean
  verified?: boolean
  message?: string
}

export const staffAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffMe: builder.query<StaffMeResponse, void>({
      query: () => '/staff/me',
      transformResponse: (response: ApiEnvelope<BackendStaffMe>) => ({
        staff: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          avatar: response.data.avatar ?? null,
        },
        permissions: response.data.permissions || [],
      }),
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
      transformResponse: (response: ApiEnvelope<LoginStaffResponse>) =>
        response.data,
    }),
    setup2FA: builder.mutation<SetupTwoFactorResponse, string>({
      query: (tempToken) => ({
        url: '/staff/2fa/setup',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }),
      transformResponse: (response: ApiEnvelope<SetupTwoFactorResponse>) =>
        response.data,
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
      transformResponse: (response: ApiEnvelope<AuthSuccessResponse>) =>
        response.data,
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
      transformResponse: (response: ApiEnvelope<AuthSuccessResponse>) =>
        response.data,
    }),
    acceptInvite: builder.mutation<
      AcceptInviteResponse,
      { token: string; password: string }
    >({
      query: (body) => ({
        url: '/staff/accept-invite',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<AcceptInviteResponse>) =>
        response.data,
    }),
    logoutStaff: builder.mutation<null, void>({
      query: () => ({
        url: '/staff/logout',
        method: 'POST',
      }),
      transformResponse: (response: ApiEnvelope<null>) => response.data,
    }),
    refreshStaffSession: builder.mutation<StaffRefreshResponse, void>({
      query: () => ({
        url: '/staff/refresh',
        method: 'POST',
      }),
      transformResponse: (response: ApiEnvelope<StaffRefreshResponse>) =>
        response.data,
    }),
    sendStaff2FAEmailOtp: builder.mutation<StaffActionStatusResponse, string>({
      query: (tempToken) => ({
        url: '/staff/2fa/email/send',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }),
      transformResponse: (response: ApiEnvelope<StaffActionStatusResponse>) =>
        response.data,
    }),
    forgotStaffPassword: builder.mutation<StaffActionStatusResponse, string>({
      query: (email) => ({
        url: '/staff/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: ApiEnvelope<StaffActionStatusResponse>) =>
        response.data,
    }),
    resendStaffResetOtp: builder.mutation<StaffActionStatusResponse, string>({
      query: (email) => ({
        url: '/staff/resend-reset-otp',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: ApiEnvelope<StaffActionStatusResponse>) =>
        response.data,
    }),
    verifyStaffResetOtp: builder.mutation<
      StaffResetOtpVerifyResponse,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: '/staff/verify-reset-otp',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<StaffResetOtpVerifyResponse>) =>
        response.data,
    }),
    resetStaffPassword: builder.mutation<
      StaffActionStatusResponse,
      {
        resetToken: string
        newPassword: string
      }
    >({
      query: (body) => ({
        url: '/staff/reset-password',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<StaffActionStatusResponse>) =>
        response.data,
    }),
    changeStaffPassword: builder.mutation<
      null,
      {
        currentPassword: string
        newPassword: string
      }
    >({
      query: (body) => ({
        url: '/staff/me/password',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiEnvelope<null>) => response.data,
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
  useLogoutStaffMutation,
  useRefreshStaffSessionMutation,
  useSendStaff2FAEmailOtpMutation,
  useForgotStaffPasswordMutation,
  useResendStaffResetOtpMutation,
  useVerifyStaffResetOtpMutation,
  useResetStaffPasswordMutation,
  useChangeStaffPasswordMutation,
} = staffAuthApi
