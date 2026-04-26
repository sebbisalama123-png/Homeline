import { useState, useCallback, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'theme'
const THEME_CHANGE_EVENT = 'homeline:theme-change'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'auto'
}

function applyTheme(theme: Theme, persist = true): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  if (theme === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }

  if (persist) {
    localStorage.setItem(STORAGE_KEY, theme)
  }
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'auto'
  const stored = localStorage.getItem(STORAGE_KEY)
  return isTheme(stored) ? stored : 'auto'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('auto')

  useEffect(() => {
    const storedTheme = readStoredTheme()
    setThemeState(storedTheme)
    applyTheme(storedTheme)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const onSystemThemeChange = () => {
      if (readStoredTheme() === 'auto') {
        applyTheme('auto', false)
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return
      }

      const nextTheme = isTheme(event.newValue) ? event.newValue : 'auto'
      setThemeState(nextTheme)
      applyTheme(nextTheme, false)
    }

    const onThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail
      if (!isTheme(nextTheme)) {
        return
      }

      setThemeState(nextTheme)
      applyTheme(nextTheme, false)
    }

    media.addEventListener('change', onSystemThemeChange)
    window.addEventListener('storage', onStorage)
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange)

    return () => {
      media.removeEventListener('change', onSystemThemeChange)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    window.dispatchEvent(
      new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: next }),
    )
  }, [])

  return { theme, setTheme }
}
