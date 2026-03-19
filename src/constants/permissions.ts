// Permission keys for RBAC
export const PERMISSIONS = {
  // RBAC
  RBAC_VIEW: 'rbac.view',
  RBAC_MANAGE: 'rbac.manage',

  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',

  // Onboarding
  ONBOARDING_VIEW: 'onboarding.view',
  ONBOARDING_MANAGE: 'onboarding.manage',

  // Plans
  PLANS_VIEW: 'plans.view',
  PLANS_MANAGE: 'plans.manage',

  // Subscriptions
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',

  // Promotions
  PROMOTIONS_VIEW: 'promotions.view',
  PROMOTIONS_MANAGE: 'promotions.manage',

  // Authors
  AUTHORS_VIEW: 'authors.view',
  AUTHORS_MANAGE: 'authors.manage',

  // Categories
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_MANAGE: 'categories.manage',

  // Books
  BOOKS_VIEW: 'books.view',
  BOOKS_MANAGE: 'books.manage',

  // Borrows
  BORROWS_VIEW: 'borrows.view',
  BORROWS_MANAGE: 'borrows.manage',

  // Members
  MEMBERS_VIEW: 'members.view',
  MEMBERS_MANAGE: 'members.manage',

  // Reservations
  RESERVATIONS_VIEW: 'reservations.view',
  RESERVATIONS_MANAGE: 'reservations.manage',

  // Audit
  AUDIT_VIEW: 'audit.view',

  // Reports
  REPORTS_VIEW: 'reports.view',

  // Settings
  SETTINGS_MANAGE: 'settings.manage',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
