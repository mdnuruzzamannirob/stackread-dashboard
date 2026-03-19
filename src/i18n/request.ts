import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

type Locale = (typeof routing.locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedLocale = await Promise.resolve(requestLocale)

  const isLocale = (l: unknown): l is Locale =>
    typeof l === 'string' && routing.locales.includes(l as Locale)

  const locale: Locale = isLocale(resolvedLocale)
    ? resolvedLocale
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
