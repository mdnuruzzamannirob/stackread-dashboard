import { baseApi } from '../baseApi'

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface RbacPermission {
  key: string
  name: string
  module: string
}

export interface RbacRole {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRbacPermissions: builder.query<RbacPermission[], void>({
      query: () => '/admin/permissions',
      transformResponse: (response: ApiEnvelope<RbacPermission[]>) =>
        response.data,
      providesTags: [{ type: 'Rbac', id: 'PERMISSIONS' }],
    }),
    getRbacRoles: builder.query<RbacRole[], void>({
      query: () => '/admin/roles',
      transformResponse: (response: ApiEnvelope<RbacRole[]>) => response.data,
      providesTags: [{ type: 'Rbac', id: 'ROLES' }],
    }),
    getRbacRoleById: builder.query<RbacRole, string>({
      query: (id) => `/admin/roles/${id}`,
      transformResponse: (response: ApiEnvelope<RbacRole>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Rbac', id }],
    }),
    createRbacRole: builder.mutation<
      RbacRole,
      { name: string; description: string; permissions: string[] }
    >({
      query: (body) => ({
        url: '/admin/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiEnvelope<RbacRole>) => response.data,
      invalidatesTags: [{ type: 'Rbac', id: 'ROLES' }],
    }),
    updateRbacRole: builder.mutation<
      RbacRole,
      {
        id: string
        body: {
          name?: string
          description?: string
          permissions?: string[]
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/roles/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiEnvelope<RbacRole>) => response.data,
      invalidatesTags: [{ type: 'Rbac', id: 'ROLES' }],
    }),
    deleteRbacRole: builder.mutation<null, string>({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiEnvelope<null>) => response.data,
      invalidatesTags: [{ type: 'Rbac', id: 'ROLES' }],
    }),
  }),
})

export const {
  useGetRbacPermissionsQuery,
  useGetRbacRolesQuery,
  useGetRbacRoleByIdQuery,
  useCreateRbacRoleMutation,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,
} = rbacApi
