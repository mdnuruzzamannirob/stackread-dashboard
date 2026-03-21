export const PERMISSIONS = {
  // Audit
  AUDIT_MANAGE: 'audit.manage',
  AUDIT_VIEW: 'audit.view',

  // Authors
  AUTHORS_MANAGE: 'authors.manage',
  AUTHORS_VIEW: 'authors.view',

  // Books
  BOOKS_MANAGE: 'books.manage',
  BOOKS_VIEW: 'books.view',

  // Borrows
  BORROWS_MANAGE: 'borrows.manage',
  BORROWS_VIEW: 'borrows.view',

  // Categories
  CATEGORIES_MANAGE: 'categories.manage',
  CATEGORIES_VIEW: 'categories.view',

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

  // RBAC
  RBAC_MANAGE: 'rbac.manage',
  RBAC_VIEW: 'rbac.view',

  // Reports
  REPORTS_MANAGE: 'reports.manage',
  REPORTS_VIEW: 'reports.view',

  // Reservations
  RESERVATIONS_MANAGE: 'reservations.manage',
  RESERVATIONS_VIEW: 'reservations.view',

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
