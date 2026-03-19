'use client'

import { useAppDispatch } from '@/store/hooks'
import { setTheme } from '@/store/slice/uiSlice'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme: setSystemTheme } = useTheme()
  const dispatch = useAppDispatch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme))
    setSystemTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleThemeChange('light')}
        className={`inline-flex items-center justify-center rounded-md p-2 ${theme === 'light' ? 'bg-muted' : ''}`}
      >
        <Sun className="size-5" />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`inline-flex items-center justify-center rounded-md p-2 ${theme === 'dark' ? 'bg-muted' : ''}`}
      >
        <Moon className="size-5" />
      </button>
    </div>
  )
}
