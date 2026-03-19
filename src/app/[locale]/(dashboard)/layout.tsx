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

  if (session.mustSetup2FA) {
    redirect(`/${locale}/2fa-setup`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardTopbar />
      <div className="flex pt-16 flex-1">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  )
}
