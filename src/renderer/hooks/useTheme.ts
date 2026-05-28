import { useState, useCallback, useEffect } from 'react'
import type { ThemeConfig } from 'antd'

type ThemeMode = 'light' | 'dark'

const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: undefined
}

const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6
  },
  algorithm: undefined
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('json-viewer-theme')
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  })

  useEffect(() => {
    localStorage.setItem('json-viewer-theme', mode)
  }, [mode])

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return { mode, theme: mode === 'dark' ? darkTheme : lightTheme, toggleTheme }
}
