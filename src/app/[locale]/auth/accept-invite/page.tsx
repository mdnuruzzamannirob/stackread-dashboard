import { AcceptInviteForm } from '@/components/features/auth/AcceptInviteForm'
import { redirect } from 'next/navigation'

export default async function AcceptInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { locale } = await params
  const { token } = await searchParams

  if (!token) {
    redirect(`/${locale}/auth/login`)
  }

  return <AcceptInviteForm token={token} />
}
