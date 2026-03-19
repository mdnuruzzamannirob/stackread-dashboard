import { InitializeAuth } from '@/components/InitializeAuth'
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
          <InitializeAuth />
          {children}
        </NextIntlClientProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
