import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()

  if (!session || session.isExpired) {
    redirect(`/${locale}/login`)
  }

  if (session.requiresTwoFactor) {
    redirect(`/${locale}/2fa-verify`)
  }

  if (session.mustSetup2FA) {
    redirect(`/${locale}/2fa-setup`)
  }

  redirect(`/${locale}/dashboard`)
}
