import { redirect } from 'next/navigation'

export default async function LegacyTwoFactorSetupPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/auth/2fa/setup`)
}
