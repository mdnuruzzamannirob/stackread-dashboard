import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedLocale = await Promise.resolve(requestLocale)
  let locale: string = (resolvedLocale as string) || routing.defaultLocale

  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
