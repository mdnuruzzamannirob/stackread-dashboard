import { AuthHydrator } from '@/components/AuthHydrator'
import { Toaster } from '@/components/ui/sonner'
import { StoreProvider } from '@/store/StoreProvider'
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
          <Toaster
            richColors
            position="top-center"
            expand
            swipeDirections={['bottom', 'left', 'right', 'top']}
          />
        </NextIntlClientProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
