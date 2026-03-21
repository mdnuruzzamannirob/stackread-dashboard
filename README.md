# Stackread Dashboard

Admin dashboard for Stackread LMS, built with Next.js App Router + RTK Query and integrated with the Stackread backend.

## Core Features

- Staff authentication flow (`/staff/login`, invite acceptance, 2FA setup/verify)
- Session cookie + automatic refresh handling (`/staff/refresh`)
- Permission-aware navigation and page guards
- RBAC management (permissions + roles CRUD)
- Staff management (invite, role update, suspend/unsuspend, reset 2FA, remove)

## Environment

Create `.env.local` with at least:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SESSION_COOKIE_NAME=stackread_staff_session
```

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Notes

- Dashboard assumes backend response envelope shape: `{ success, message, data }`
- Staff/admin API calls use `bearerStaffAuth` endpoints from backend OpenAPI
- Unauthorized API responses attempt silent refresh once before forced logout
