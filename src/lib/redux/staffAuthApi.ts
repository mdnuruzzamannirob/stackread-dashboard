import { baseApi } from './baseApi'

export interface StaffMeResponse {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  actorType: 'staff' | 'super_admin'
}

export const staffAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffMe: builder.query<StaffMeResponse, void>({
      query: () => '/staff/me',
      providesTags: ['Staff'],
    }),
  }),
})

export const { useGetStaffMeQuery } = staffAuthApi
