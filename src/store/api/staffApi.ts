import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface StaffListItem {
  id: string
  name: string
  email: string
  phone?: string
  roleId?: string
  isActive: boolean
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface StaffActivityItem {
  id: string
  action: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<StaffListItem[], void>({
      query: () => '/admin/staff',
      transformResponse: (response: ApiEnvelope<StaffListItem[]>) =>
        response.data,
      providesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    getStaffById: builder.query<StaffListItem, string>({
      query: (id) => `/admin/staff/${id}`,
      transformResponse: (response: ApiEnvelope<StaffListItem>) =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),
    getStaffActivity: builder.query<StaffActivityItem[], string>({
      query: (id) => `/admin/staff/${id}/activity`,
      transformResponse: (response: ApiEnvelope<StaffActivityItem[]>) =>
        response.data,
      providesTags: (result, error, id) => [{ type: 'Staff', id: `ACT-${id}` }],
    }),
    inviteStaff: builder.mutation<
      { email: string; roleId: string; expiresAt: string },
      {
        name: string
        email: string
        roleId: string
        phone?: string
        expiresInDays?: number
      }
    >({
      query: (body) => ({
        url: '/admin/staff/invite',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ApiEnvelope<{
          email: string
          roleId: string
          expiresAt: string
        }>,
      ) => response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    reinviteStaff: builder.mutation<
      { staffId: string; email: string; expiresAt: string },
      string
    >({
      query: (id) => ({
        url: `/admin/staff/${id}/reinvite`,
        method: 'POST',
      }),
      transformResponse: (
        response: ApiEnvelope<{
          staffId: string
          email: string
          expiresAt: string
        }>,
      ) => response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    updateStaffRole: builder.mutation<
      StaffListItem,
      { id: string; roleId: string }
    >({
      query: ({ id, roleId }) => ({
        url: `/admin/staff/${id}/role`,
        method: 'PATCH',
        body: { roleId },
      }),
      transformResponse: (response: ApiEnvelope<StaffListItem>) =>
        response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    suspendStaff: builder.mutation<StaffListItem, string>({
      query: (id) => ({
        url: `/admin/staff/${id}/suspend`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiEnvelope<StaffListItem>) =>
        response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    unsuspendStaff: builder.mutation<StaffListItem, string>({
      query: (id) => ({
        url: `/admin/staff/${id}/unsuspend`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiEnvelope<StaffListItem>) =>
        response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    resetStaff2FA: builder.mutation<StaffListItem, string>({
      query: (id) => ({
        url: `/admin/staff/${id}/2fa/reset`,
        method: 'POST',
      }),
      transformResponse: (response: ApiEnvelope<StaffListItem>) =>
        response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
    removeStaff: builder.mutation<null, string>({
      query: (id) => ({
        url: `/admin/staff/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiEnvelope<null>) => response.data,
      invalidatesTags: [{ type: 'Staff', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetStaffListQuery,
  useGetStaffByIdQuery,
  useGetStaffActivityQuery,
  useInviteStaffMutation,
  useReinviteStaffMutation,
  useUpdateStaffRoleMutation,
  useSuspendStaffMutation,
  useUnsuspendStaffMutation,
  useResetStaff2FAMutation,
  useRemoveStaffMutation,
} = staffApi
