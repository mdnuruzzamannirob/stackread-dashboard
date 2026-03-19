export const PERMISSIONS = {
  // Audit
  AUDIT_VIEW: 'audit.view',
  AUDIT_MANAGE: 'audit.manage',

  // Authors
  AUTHORS_MANAGE: 'authors.manage',

  // Books
  BOOKS_MANAGE: 'books.manage',

  // Borrows
  BORROWS_VIEW: 'borrows.view',
  BORROWS_MANAGE: 'borrows.manage',

  // Categories
  CATEGORIES_MANAGE: 'categories.manage',

  // Members
  MEMBERS_VIEW: 'members.view',
  MEMBERS_MANAGE: 'members.manage',

  // Notifications
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',

  // Plans
  PLANS_MANAGE: 'plans.manage',

  // Promotions
  PROMOTIONS_VIEW: 'promotions.view',
  PROMOTIONS_MANAGE: 'promotions.manage',

  // RBAC
  RBAC_VIEW: 'rbac.view',
  RBAC_MANAGE: 'rbac.manage',

  // Reading History
  READING_MANAGE: 'reading.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_MANAGE: 'reports.manage',

  // Reservations
  RESERVATIONS_VIEW: 'reservations.view',
  RESERVATIONS_MANAGE: 'reservations.manage',

  // Reviews
  REVIEWS_MANAGE: 'reviews.manage',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Staff Management
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',

  // Subscriptions
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export function hasPermission(
  userPermissions: string[],
  requiredPermission: Permission,
): boolean {
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userPermissions: string[],
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => userPermissions.includes(permission))
}

export function hasAllPermissions(
  userPermissions: string[],
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => userPermissions.includes(permission))
}
