import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const AUTH_PATHS = [
  '/login',
  '/accept-invite',
  '/2fa-setup',
  '/2fa-verify',
  '/forgot-password',
  '/verify-reset-otp',
  '/reset-password',
]
const PUBLIC_PATHS = [...AUTH_PATHS]
const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'stackread_staff_session'

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const [, locale = 'en', ...rest] = pathname.split('/')
  const pathWithoutLocale = `/${rest.join('/')}`
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  const isAuthPath = AUTH_PATHS.some(
    (authPath) => pathWithoutLocale === authPath,
  )
  const isPublicPath = PUBLIC_PATHS.some(
    (publicPath) => pathWithoutLocale === publicPath,
  )

  if (!isPublicPath && !hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|\\..*).*)'],
}
