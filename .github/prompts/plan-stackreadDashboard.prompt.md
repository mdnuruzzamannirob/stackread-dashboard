# Plan: Stackread Dashboard (Admin and Staff App)

## Mission

Build admin.stackread.com as a secure Next.js 16 dashboard for staff and admin users only, fully aligned with implemented backend endpoints and route-level permissions.

## Core Stack

- Next.js 16 App Router + strict TypeScript
- Tailwind CSS v4 + @theme + oklch tokens in globals.css
- shadcn/ui, Redux Toolkit + RTK Query, React Hook Form + Zod
- next-intl (en, bn), next-themes, Framer Motion, Sonner, Lucide React
- Recharts for analytics
- qrcode for mandatory 2FA setup UX
- Vitest + Testing Library
- Vercel deployment

## Design System

- Font: Geist
- Color direction: Blue/Indigo aligned with web app
- Theme: dark and light toggle
- Density: comfortable enterprise spacing
- Reusable admin primitives: DataTable, FilterBar, PageHeader, StatCard, ConfirmDialog, PermissionGuard

## Navigation

- Collapsible left sidebar with permission-aware items
- Top navbar: Cmd+K search, notifications bell, activity feed, theme switch, profile menu
- Mobile: collapsible drawer sidebar

## Auth Architecture (Next.js 16)

- proxy.ts handles only simple redirects and locale handling
- Protected layout server component validates session and redirects
- No middleware auth model
- Staff 2FA mandatory and cannot be skipped
- First login must complete setup flow before protected dashboard access
- Session token is httpOnly cookie

## Mandatory Staff Auth Flows

1. POST /staff/login

- If mustSetup2FA = true, route to /staff/2fa/setup
- If requiresTwoFactor = true, route to /staff/2fa/verify

2. Setup flow

- POST /staff/2fa/setup with tempToken to fetch QR payload
- POST /staff/2fa/enable with tempToken + otp to activate and issue access token

3. Verify flow

- POST /staff/2fa/verify with tempToken + otp to issue access token
- POST /staff/2fa/email/send to send OTP to staff email (alternative path)

4. Invite flow

- POST /staff/accept-invite
- Immediately enforce mandatory 2FA setup on first login

5. Password recovery flow

- POST /staff/forgot-password
- POST /staff/resend-reset-otp
- POST /staff/verify-reset-otp
- POST /staff/reset-password

6. Session management

- POST /staff/logout
- POST /staff/refresh (renew session token)

## Permission System (from backend guards)

- audit.manage, audit.view
- authors.manage
- books.manage
- categories.manage
- members.manage, members.view
- notifications.manage
- payments.manage, payments.view
- plans.manage
- promotions.manage, promotions.view
- publishers.manage
- rbac.manage, rbac.view
- reports.manage, reports.view
- reviews.manage, reviews.view
- settings.manage, settings.view
- staff.manage, staff.view
- subscriptions.manage, subscriptions.view

## Complete Page Inventory

Each page includes route, purpose, required permission, rendering strategy, APIs, and key components.

### Auth Pages

1. Route: /[locale]/login

- Permission: Public staff-auth
- Render: Client form
- APIs: POST /staff/login
- Components: StaffLoginForm

2. Route: /[locale]/2fa-setup

- Permission: temp-auth only
- Render: Client
- APIs: POST /staff/2fa/setup, POST /staff/2fa/enable
- Components: QRSetupPanel, OTPEnableForm

3. Route: /[locale]/2fa-verify

- Permission: temp-auth only
- Render: Client
- APIs: POST /staff/2fa/verify
- Components: OTPVerifyForm

4. Route: /[locale]/accept-invite

- Permission: Public invite token
- Render: Client
- APIs: POST /staff/accept-invite
- Components: AcceptInviteForm

5. Route: /[locale]/forgot-password

- Permission: Public staff-auth
- Render: Client
- APIs: POST /staff/forgot-password, POST /staff/resend-reset-otp
- Components: StaffForgotPasswordForm

6. Route: /[locale]/verify-reset-otp

- Permission: Public staff-auth
- Render: Client
- APIs: POST /staff/verify-reset-otp
- Components: StaffResetOtpVerifyForm

7. Route: /[locale]/reset-password

- Permission: Public staff-auth
- Render: Client
- APIs: POST /staff/reset-password
- Components: StaffResetPasswordForm

### Auth API Endpoints (Non-Page)

- GET /staff/me
- PATCH /staff/me/password
- POST /staff/logout
- POST /staff/refresh
- POST /staff/forgot-password (staff password recovery)
- POST /staff/resend-reset-otp
- POST /staff/verify-reset-otp
- POST /staff/reset-password
- POST /staff/2fa/email/send (OTP delivery alternative to QR)
- POST /staff/2fa/disable

### Topbar/Session Utility APIs (Non-Page)

- GET /notifications
- GET /notifications/unread-count
- PATCH /notifications/:id/read
- PATCH /notifications/mark-read

### Admin and Staff Pages

8. Route: /[locale]/dashboard

- Permission: authenticated staff
- Render: Server + client charts
- APIs: GET /admin/reports/admin-overview, GET /admin/audit/logs
- Components: KPIGrid, RevenueTrendChart, ActivityFeed

9. Route: /[locale]/books

- Permission: books.manage
- Render: Server table + client filters
- APIs: GET /books
- Components: BookDataTable, BookFilterPanel

10. Route: /[locale]/books/new

- Permission: books.manage
- Render: Client form
- APIs: POST /admin/books, GET /authors, GET /categories
- Components: BookCreateForm, FileUploader

11. Route: /[locale]/books/[id]/edit

- Permission: books.manage
- Render: Client form
- APIs: GET /books/:id, PUT /admin/books/:id, DELETE /admin/books/:id, POST /admin/books/:id/files, DELETE /admin/books/:id/files/:fid, PATCH /admin/books/:id/featured, PATCH /admin/books/:id/availability, PATCH /admin/books/:id/status
- Components: BookEditForm, FileManager

12. Route: /[locale]/books/import

- Permission: books.manage
- Render: Client
- APIs: POST /admin/books/bulk-import
- Components: BulkImportWizard

13. Route: /[locale]/authors

- Permission: authors.manage
- Render: Server list + client actions
- APIs: GET /authors, POST /authors, PUT /authors/:id, DELETE /authors/:id
- Components: AuthorTable, AuthorFormDialog

14. Route: /[locale]/authors/[id]

- Permission: authors.manage
- Render: Server
- APIs: GET /authors/:id
- Components: AuthorDetailPanel

15. Route: /[locale]/categories

- Permission: categories.manage
- Render: Server + client editor
- APIs: GET /categories, POST /categories, PUT /categories/:id, DELETE /categories/:id
- Components: CategoryTreeEditor

16. Route: /[locale]/categories/[id]

- Permission: categories.manage
- Render: Server
- APIs: GET /categories/:id
- Components: CategoryDetailCard

17. Route: /[locale]/members

- Permission: members.view
- Render: Server table + client filters
- APIs: GET /admin/members
- Components: MembersTable

18. Route: /[locale]/members/[userId]

- Permission: members.view (read), members.manage (suspend/unsuspend/delete)
- Render: Server + client tabs
- APIs: GET /admin/members/:userId, GET /admin/members/:userId/reading-history, GET /admin/members/:userId/payments, PATCH /admin/members/:userId/suspend, PATCH /admin/members/:userId/unsuspend, DELETE /admin/members/:userId
- Components: MemberProfileTab, MemberReadingTab, MemberPaymentsTab

19. Route: /[locale]/subscriptions

- Permission: subscriptions.view
- Render: Server
- APIs: GET /subscriptions
- Components: SubscriptionTable

20. Route: /[locale]/subscriptions/[id]

- Permission: subscriptions.view
- Render: Server + client actions
- APIs: GET /subscriptions/:id, PATCH /subscriptions/:id
- Components: SubscriptionDetailPanel

21. Route: /[locale]/payments

- Permission: payments.view
- Render: Server
- APIs: GET /payments
- Components: PaymentsTable

22. Route: /[locale]/payments/[id]

- Permission: payments.view
- Render: Server + client refund action
- APIs: GET /payments/:id, POST /payments/:id/refund
- Components: PaymentDetailCard, RefundDialog

23. Route: /[locale]/promotions/coupons

- Permission: promotions.view (read), promotions.manage (create/update/toggle/delete)
- Render: Server + client form modals
- APIs: GET /coupons, POST /coupons, GET /coupons/:id, PUT /coupons/:id, PATCH /coupons/:id/toggle, DELETE /coupons/:id
- Components: CouponTable, CouponForm

24. Route: /[locale]/promotions/flash-sales

- Permission: promotions.view (read), promotions.manage (create/update/toggle/delete)
- Render: Server + client form modals
- APIs: GET /flash-sales, POST /flash-sales, PUT /flash-sales/:id, PATCH /flash-sales/:id/toggle, DELETE /flash-sales/:id
- Components: FlashSaleTable, FlashSaleForm

25. Route: /[locale]/reviews

- Permission: reviews.view (read), reviews.manage (moderation)
- Render: Server + client moderation actions
- APIs: GET /admin/reviews, PATCH /admin/reviews/:id/toggle
- Components: ReviewModerationTable

26. Route: /[locale]/publishers

- Permission: publishers.manage
- Render: Server + client form/dialog actions
- APIs: GET /publishers, GET /publishers/:id, POST /publishers, PATCH /publishers/:id, DELETE /publishers/:id
- Components: PublisherTable, PublisherFormDialog

27. Route: /[locale]/plans

- Permission: plans.manage
- Render: Server + client form/dialog actions
- APIs: GET /plans, POST /plans, GET /plans/:id, PUT /plans/:id, PATCH /plans/:id/toggle
- Components: PlanTable, PlanFormDialog

28. Route: /[locale]/staff

- Permission: staff.view
- Render: Server
- APIs: GET /admin/staff, POST /admin/staff/invite
- Components: StaffTable, InviteStaffDialog

29. Route: /[locale]/staff/[id]

- Permission: staff.view (read), staff.manage (mutations)
- Render: Server + client actions
- APIs: GET /admin/staff/:id, GET /admin/staff/:id/activity, PATCH /admin/staff/:id/role, PATCH /admin/staff/:id/suspend, PATCH /admin/staff/:id/unsuspend, POST /admin/staff/:id/reinvite, POST /admin/staff/:id/2fa/reset, DELETE /admin/staff/:id
- Components: StaffProfileCard, ActivityTimeline

30. Route: /[locale]/rbac/roles

- Permission: rbac.view (read), rbac.manage (mutations)
- Render: Server + client matrix editor
- APIs: GET /admin/permissions, GET /admin/roles, POST /admin/roles, GET /admin/roles/:id, PUT /admin/roles/:id, DELETE /admin/roles/:id
- Components: RoleTable, PermissionMatrixEditor

31. Route: /[locale]/audit

- Permission: audit.view
- Render: Server + client export actions
- APIs: GET /admin/audit/logs, GET /admin/audit/logs/export, POST /admin/audit/activity
- Components: AuditTimeline, ExportActions

32. Route: /[locale]/reports

- Permission: reports.view (read), reports.manage (create/process)
- Render: Server + client trigger actions
- APIs: GET /admin/reports, POST /admin/reports, POST /admin/reports/process
- Components: ReportsTable, CreateReportDialog

33. Route: /[locale]/reports/[reportId]

- Permission: reports.view
- Render: Server
- APIs: GET /admin/reports/:reportId, GET /admin/reports/:reportId/download
- Components: ReportDetailCard

34. Route: /[locale]/settings

- Permission: settings.view (read), settings.manage (update)
- Render: Server + client section forms
- APIs: GET /admin/settings, PUT /admin/settings, GET /admin/settings/maintenance
- Components: SettingsSections, MaintenanceToggle

35. Route: /[locale]/notifications/broadcast

- Permission: notifications.manage
- Render: Client form
- APIs: POST /notifications/bulk-send
- Components: BroadcastComposer

### Special Pages

36. Route: /[locale]/not-found

- Permission: Public
- Render: Server
- APIs: none

37. Route: /[locale]/forbidden

- Permission: Public
- Render: Server
- APIs: none

38. Route: /[locale]/error

- Permission: Public
- Render: Client error boundary
- APIs: none

39. Loading skeletons per module

- Permission: contextual
- APIs: none

40. Empty states per module

- Permission: contextual
- APIs: none

## Component Architecture

### Shared/Common

- DataTable, StatCard, ChartCard, PageHeader, EmptyState, ErrorState, ConfirmDialog, PermissionGuard, ExportButton, StatusBadge
- Decision: mostly server-compatible wrappers with client interactive variants

### Layout

- DashboardSidebar, DashboardTopbar, CommandPalette, NotificationBell, ActivityDrawer, ThemeToggle, ProfileMenu
- Decision: shell on server, interactions on client

### Feature Modules

- Auth: StaffLoginForm, TwoFactorSetupFlow, TwoFactorVerifyForm, InviteAcceptForm
- Books: BookTable, BookForm, FileUploadPanel
- Members: MemberTable, MemberTabs
- Plans: PlanTable, PlanFormDialog
- Staff: StaffTable, InviteDialog, RoleAssignDialog
- RBAC: RoleTable, PermissionMatrix
- Reports: ReportBuilder, ReportStatusTable
- Audit: AuditLogTable, AuditExportPanel
- Settings: GeneralSettingsForm, PaymentSettingsForm, MaintenanceSettingsForm
- Promotions: CouponManager, FlashSaleManager

## Server vs Client Rules

- Server components for tables/detail pages initial fetch and SEO-safe output
- Client components for mutation-heavy tools, charts interactivity, dialogs, forms, and command palette
- Permission checks at both layout level and component guard level

## Redux Store Structure

- src/store/index.ts
- src/store/hooks.ts
- src/store/baseApi.ts
- src/store/baseQueryWithReauth.ts
- src/store/features/auth/authSlice.ts
- src/store/features/auth/staffAuthApi.ts
- src/store/features/ui/uiSlice.ts
- src/store/features/books/adminBooksApi.ts
- src/store/features/authors/adminAuthorsApi.ts
- src/store/features/categories/adminCategoriesApi.ts
- src/store/features/publishers/adminPublishersApi.ts
- src/store/features/members/adminMembersApi.ts
- src/store/features/staff/adminStaffApi.ts
- src/store/features/rbac/adminRbacApi.ts
- src/store/features/plans/adminPlansApi.ts
- src/store/features/subscriptions/adminSubscriptionsApi.ts
- src/store/features/payments/adminPaymentsApi.ts
- src/store/features/promotions/adminPromotionsApi.ts
- src/store/features/reviews/adminReviewsApi.ts
- src/store/features/notifications/adminNotificationsApi.ts
- src/store/features/reports/adminReportsApi.ts
- src/store/features/audit/adminAuditApi.ts
- src/store/features/settings/adminSettingsApi.ts

Auth slice fields:

- actorType staff, token, staff profile, permissions map, mustSetup2FA, requiresTwoFactor, tempToken, isHydrated

UI slice fields:

- sidebarCollapsed, theme, cmdkOpen, tableFilters

## RTK Query Strategy

- All feature APIs injected into one baseApi
- Domain tags per module for targeted invalidation
- 401 handling: clear auth state and redirect to /login
- Server components use direct server fetching for initial snapshots
- Client components own mutation workflows and optimistic updates

## Internationalization

- Locales: en and bn
- messages/en.json and messages/bn.json
- URL locale segments /en and /bn

## Project Structure

- src/app/[locale]/(auth)/\*
- src/app/[locale]/dashboard/\*
- src/app/[locale]/books/\*
- src/app/[locale]/authors/\*
- src/app/[locale]/categories/\*
- src/app/[locale]/publishers/\*
- src/app/[locale]/members/\*
- src/app/[locale]/subscriptions/\*
- src/app/[locale]/payments/\*
- src/app/[locale]/promotions/\*
- src/app/[locale]/reviews/\*
- src/app/[locale]/staff/\*
- src/app/[locale]/rbac/\*
- src/app/[locale]/plans/\*
- src/app/[locale]/audit/\*
- src/app/[locale]/reports/\*
- src/app/[locale]/settings/\*
- src/app/[locale]/notifications/\*
- src/components/common/\*
- src/components/layout/\*
- src/components/features/\*
- src/lib/api/\*
- src/lib/auth/\*
- src/store/\*
- src/messages/en.json
- src/messages/bn.json

## Environment Template (.env.local)

- NEXT_PUBLIC_APP_URL=http://localhost:3001
- NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
- NEXT_PUBLIC_DEFAULT_LOCALE=en
- NEXT_PUBLIC_SUPPORTED_LOCALES=en,bn
- SESSION_COOKIE_NAME=stackread_staff_session
- SESSION_COOKIE_SECURE=false
- INTERNAL_API_TIMEOUT_MS=15000
- NEXT_PUBLIC_ENABLE_ACTIVITY_FEED=true

## Endpoint Coverage Index (Backend Implemented)

- OpenAPI paths mapped: 150
- OpenAPI operations mapped: 184
- Postman requests mapped: 184
- OpenAPI and Postman are in sync for operation coverage (after placeholder/query normalization)
- Dashboard planning uses these artifacts plus mounted router truth in src/app/routes.ts

## Implementation Phases

### Phase 1: Foundation

- Build: Next.js setup, design tokens, shared layout, store base, protected layout checks, i18n bootstrapping
- Pages/components: global shells, sidebar/topbar, base primitives
- APIs: GET /health, GET /staff/me
- Permissions: authenticated staff baseline
- Dependencies: next-intl, next-themes, redux toolkit, shadcn
- Order: bootstrap -> layout -> state -> i18n -> guard rails

### Phase 2: Auth + Mandatory 2FA + Permission System

- Build: login, mandatory setup/verify 2FA, invite acceptance, password recovery, permission utilities
- Pages/components: auth routes and PermissionGuard
- APIs: /staff/login, /staff/2fa/setup, /staff/2fa/enable, /staff/2fa/verify, /staff/2fa/email/send, /staff/2fa/disable, /staff/accept-invite, /staff/me, /staff/me/password, /staff/logout, /staff/refresh, /staff/forgot-password, /staff/resend-reset-otp, /staff/verify-reset-otp, /staff/reset-password
- Permissions: route gate matrix by backend keys
- Dependencies: qrcode, react-hook-form, zod
- Order: login -> setup -> verify -> session hydration -> permission guard -> password recovery flows

### Phase 3: Overview + Books + Authors + Categories

- Build: overview dashboard and catalog admin modules
- APIs: /admin/reports/admin-overview, /books, /admin/books*, /authors*, /categories\*
- Permissions: books.manage, authors.manage, categories.manage
- Dependencies: recharts, table components
- Order: overview -> books -> authors -> categories

### Phase 4: Members + Staff + RBAC

- Build: member management, staff lifecycle, role/permission matrix
- APIs: /admin/members*, /admin/staff*, /admin/permissions, /admin/roles\*
- Permissions: members._, staff._, rbac.\*
- Order: members -> staff -> roles

### Phase 5: Plans + Subscriptions + Payments + Promotions

- Build: plan configuration, billing operations, and discount controls
- APIs: /plans*, /subscriptions*, /payments*, /coupons*, /flash-sales\*
- Permissions: plans.manage, subscriptions._, payments._, promotions.\*
- Order: plans -> subscriptions -> payments -> promotions

### Phase 6: Reports + Audit + Settings

- Build: report management, audit visibility/export, system settings
- APIs: /admin/reports*, /admin/audit/logs*, /admin/settings\*
- Permissions: reports._, audit._, settings.\*
- Order: reports -> audit -> settings

### Phase 7: Notifications + Reviews + Publishers

- Build: communications, moderation, and publisher management tools
- APIs: /notifications/bulk-send, /admin/reviews*, /publishers*
- Permissions: notifications.manage, reviews.\_, publishers.manage
- Order: notifications -> reviews -> publishers

### Phase 8: i18n + Testing + Deploy

- Build: translation completion, full test suite, deployment hardening
- APIs: all integrated endpoint smoke checks
- Permissions: all role-path tests
- Order: translation freeze -> test pass -> release readiness

## Backend Inconsistencies to Track

- Legacy docs list endpoint /admin/notifications/send; implemented endpoint is POST /notifications/bulk-send.
- Legacy docs list settings sub-routes; implemented settings API is GET/PUT /admin/settings with a separate GET /admin/settings/maintenance.
- Legacy docs show separate webhook endpoints; backend currently implements POST /webhooks/:gateway.
- Some docs describe admin role separately; backend model uses staff accounts + RBAC permissions.

## Non-Negotiables

- Backend route definitions are source of truth
- Staff 2FA mandatory, cannot skip
- No fake/mock/placeholder data
- Auth checks in layout server boundary, not proxy
- Permission-aware navigation and route guards everywhere
- Respect backend response envelope (`success`, `message`, `data`, `meta`) in API adapters and error handling
