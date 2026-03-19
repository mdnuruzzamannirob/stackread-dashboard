import { AuthHydrator } from '@/components/auth/AuthHydrator'
import { StoreProvider } from '@/lib/redux/StoreProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>
        <NextIntlClientProvider messages={messages}>
          <AuthHydrator />
          {children}
        </NextIntlClientProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
