import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggle: () => void
  setTheme: (mode: 'light' | 'dark' | 'system') => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function resolveTheme(mode: string): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function applyTheme(mode: string) {
  if (typeof window === 'undefined') return
  const isDark = resolveTheme(mode)
  const cls = isDark ? 'dark' : 'light'
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(cls)
  document.documentElement.style.colorScheme = cls
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<string>('auto')
  const [isDark, setIsDark] = useState(false)

  const setMode = (m: string) => {
    localStorage.setItem('theme', m)
    setModeState(m)
    setIsDark(resolveTheme(m))
    applyTheme(m)
  }

  const toggle = () => setMode(isDark ? 'light' : 'dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = stored || 'auto'
    setModeState(initial)
    setIsDark(resolveTheme(initial))
    applyTheme(initial)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggle, setTheme: setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
