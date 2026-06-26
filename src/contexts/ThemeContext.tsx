import { createContext, useContext, useEffect, useState } from 'react'
import { useAutoEcole } from '@/hooks/useAutoEcole'

const COLOR_KEY = 'permisflow_color'
const DARK_KEY  = 'permisflow_dark'

function darken(hex: string, amount = 0.18): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const d = (v: number) => Math.max(0, Math.round(v * (1 - amount)))
  return `#${d(r).toString(16).padStart(2,'0')}${d(g).toString(16).padStart(2,'0')}${d(b).toString(16).padStart(2,'0')}`
}

function applyColorToDom(hex: string) {
  document.documentElement.style.setProperty('--color-primary', hex)
  document.documentElement.style.setProperty('--color-primary-dark', darken(hex))
}

interface ThemeCtx {
  primaryColor: string
  isDark: boolean
  applyColor: (hex: string) => void
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeCtx>({
  primaryColor: '#2563EB',
  isDark: false,
  applyColor: () => {},
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem(COLOR_KEY) ?? '#2563EB'
  })
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(DARK_KEY) === '1'
  })

  const { data: autoEcole } = useAutoEcole()

  // Apply color on mount (sync from localStorage)
  useEffect(() => {
    applyColorToDom(primaryColor)
  }, [])

  // Sync color from saved auto-école (e.g. after a fresh load)
  useEffect(() => {
    if (autoEcole?.couleur_principale && autoEcole.couleur_principale !== primaryColor) {
      const saved = autoEcole.couleur_principale
      setPrimaryColor(saved)
      applyColorToDom(saved)
      localStorage.setItem(COLOR_KEY, saved)
    }
  }, [autoEcole?.couleur_principale])

  // Apply dark mode on mount + on change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const applyColor = (hex: string) => {
    setPrimaryColor(hex)
    applyColorToDom(hex)
    localStorage.setItem(COLOR_KEY, hex)
  }

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem(DARK_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ primaryColor, isDark, applyColor, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
