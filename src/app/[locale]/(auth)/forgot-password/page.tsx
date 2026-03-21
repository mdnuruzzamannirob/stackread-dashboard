import { ForgotPasswordForm } from '@/components/modules/auth/ForgotPasswordForm'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()

  if (session && !session.isExpired) {
    redirect(`/${locale}/dashboard`)
  }

  return <ForgotPasswordForm />
}
