import { useState, useCallback, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'theme'

function applyTheme(theme: Theme): void {
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
  localStorage.setItem(STORAGE_KEY, theme)
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'auto'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'auto'
    ? stored
    : 'auto'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('auto')

  useEffect(() => {
    const storedTheme = readStoredTheme()
    setThemeState(storedTheme)
    applyTheme(storedTheme)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
  }, [])

  return { theme, setTheme }
}
