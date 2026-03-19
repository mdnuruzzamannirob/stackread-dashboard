import Cookies from 'js-cookie'

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || 'stackread_staff_session'
const TEMP_TOKEN_STORAGE_KEY = 'stackread_staff_temp_token'
const TEMP_MODE_STORAGE_KEY = 'stackread_staff_temp_mode'

const isHttps = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.location.protocol === 'https:'
}

export const setSessionTokenCookie = (token: string): void => {
  Cookies.set(SESSION_COOKIE_NAME, token, {
    expires: 7,
    sameSite: 'lax',
    secure: isHttps(),
    path: '/',
  })
}

export const getSessionTokenCookie = (): string | null => {
  return Cookies.get(SESSION_COOKIE_NAME) ?? null
}

export const clearSessionTokenCookie = (): void => {
  Cookies.remove(SESSION_COOKIE_NAME, { path: '/' })
}

export const setTempTokenStorage = (
  token: string,
  mode: 'setup' | 'verify',
): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(TEMP_TOKEN_STORAGE_KEY, token)
  window.sessionStorage.setItem(TEMP_MODE_STORAGE_KEY, mode)
}

export const getTempTokenStorage = (): {
  token: string | null
  mode: 'setup' | 'verify' | null
} => {
  if (typeof window === 'undefined') {
    return { token: null, mode: null }
  }

  const token = window.sessionStorage.getItem(TEMP_TOKEN_STORAGE_KEY)
  const modeRaw = window.sessionStorage.getItem(TEMP_MODE_STORAGE_KEY)

  if (modeRaw !== 'setup' && modeRaw !== 'verify') {
    return { token, mode: null }
  }

  return {
    token,
    mode: modeRaw,
  }
}

export const clearTempTokenStorage = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(TEMP_TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(TEMP_MODE_STORAGE_KEY)
}
