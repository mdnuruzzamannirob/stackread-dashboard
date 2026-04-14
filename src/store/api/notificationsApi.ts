import { baseApi } from '../baseApi'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  relatedEntityId?: string
  relatedEntityType?: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface BulkSendRequest {
  userIds: string[]
  type: string
  title: string
  body: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface BulkSendResponse {
  sentCount: number
  notificationIds: string[]
}

export interface NotificationListResponse {
  success: boolean
  message: string
  data: Notification[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
  }
}

export interface UnreadCountResponse {
  success: boolean
  message: string
  data: {
    unreadCount: number
  }
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    bulkSendNotifications: builder.mutation<BulkSendResponse, BulkSendRequest>({
      query: (body) => ({
        url: '/notifications/bulk-send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    getNotifications: builder.query<
      NotificationListResponse,
      {
        page?: number
        limit?: number
        read?: boolean
      }
    >({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markNotificationsRead: builder.mutation<
      void,
      { notificationIds: string[] }
    >({
      query: (body) => ({
        url: '/notifications/mark-read',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),
  }),
})

export const {
  useBulkSendNotificationsMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadMutation,
  useGetUnreadCountQuery,
} = notificationsApi
