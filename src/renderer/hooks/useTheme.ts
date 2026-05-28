import { useState, useCallback, useEffect } from 'react'
import type { ThemeConfig } from 'antd'
import { theme } from 'antd'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'json-viewer-theme'

const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: theme.darkAlgorithm
}

const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: theme.defaultAlgorithm
}

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

  return { mode, theme: mode === 'dark' ? darkTheme : lightTheme, toggleTheme }
}
