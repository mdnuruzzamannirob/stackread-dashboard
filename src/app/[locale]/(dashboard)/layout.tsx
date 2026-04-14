import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <DashboardTopbar />
        <main className="min-w-0 flex-1 px-3 pb-4 pt-24 md:px-4 md:pb-5 md:pt-24 lg:px-5 lg:pb-6 lg:pt-24">
          {children}
        </main>
      </div>
    </div>
  )
}
