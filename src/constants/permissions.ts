export const PERMISSIONS = {
  // Audit
  AUDIT_MANAGE: 'audit.manage',
  AUDIT_VIEW: 'audit.view',

  // Authors
  AUTHORS_MANAGE: 'authors.manage',

  // Books
  BOOKS_MANAGE: 'books.manage',

  // Categories
  CATEGORIES_MANAGE: 'categories.manage',

  // Members
  MEMBERS_MANAGE: 'members.manage',
  MEMBERS_VIEW: 'members.view',

  // Notifications
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Payments
  PAYMENTS_MANAGE: 'payments.manage',
  PAYMENTS_VIEW: 'payments.view',

  // Plans
  PLANS_MANAGE: 'plans.manage',

  // Promotions
  PROMOTIONS_MANAGE: 'promotions.manage',
  PROMOTIONS_VIEW: 'promotions.view',

  // Publishers
  PUBLISHERS_MANAGE: 'publishers.manage',

  // RBAC
  RBAC_MANAGE: 'rbac.manage',
  RBAC_VIEW: 'rbac.view',

  // Reports
  REPORTS_MANAGE: 'reports.manage',
  REPORTS_VIEW: 'reports.view',

  // Reviews
  REVIEWS_MANAGE: 'reviews.manage',
  REVIEWS_VIEW: 'reviews.view',

  // Settings
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_VIEW: 'settings.view',

  // Staff
  STAFF_MANAGE: 'staff.manage',
  STAFF_VIEW: 'staff.view',

  // Subscriptions
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
