import { useState, useCallback, useEffect } from 'react'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'json-viewer-theme'

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  })

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return { mode, toggleTheme }
}
