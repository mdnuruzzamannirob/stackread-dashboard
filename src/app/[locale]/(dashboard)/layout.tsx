import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
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

  if (session.mustSetup2FA) {
    redirect(`/${locale}/2fa-setup`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 p-4 pt-20 md:p-6 md:pt-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
