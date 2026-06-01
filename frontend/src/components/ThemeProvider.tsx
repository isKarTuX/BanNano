import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "dark" | "light"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: Theme
  toggleTheme: (originX?: number, originY?: number) => void
  isTransitioning: boolean
}

const initialState: ThemeProviderState = {
  theme: "dark",
  resolvedTheme: "dark",
  toggleTheme: () => null,
  isTransitioning: false,
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "bannano-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => {
      const stored = localStorage.getItem(storageKey) as Theme | null
      // Solo aceptar dark o light, nunca system
      return stored === "light" ? "light" : defaultTheme
    }
  )

  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    // Evita parpadeos si la clase ya es correcta (ej. tras startViewTransition)
    if (!root.classList.contains(theme)) {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#1a1823" : "#ede9f5"
      )
    }
  }, [theme])

  const toggleTheme = useCallback((originX?: number, originY?: number) => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    
    // Si no hay coordenadas, cambio inmediato
    if (originX == null || originY == null) {
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
      return
    }

    const root = document.documentElement
    root.style.setProperty("--ripple-x", `${originX}px`)
    root.style.setProperty("--ripple-y", `${originY}px`)
    
    // Transición profesional con View Transitions API
    if ('startViewTransition' in document) {
      setIsTransitioning(true)
      
      const transition = document.startViewTransition(() => {
        // Cambio sincrono de clase para que el navegador capture el nuevo estado visual
        root.classList.remove("light", "dark")
        root.classList.add(nextTheme)
        localStorage.setItem(storageKey, nextTheme)
        setThemeState(nextTheme)
      })
      
      transition.finished.finally(() => {
        setIsTransitioning(false)
      })
    } else {
      // Fallback para navegadores sin soporte: cambio inmediato
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
    }
  }, [theme, storageKey])

  const value = {
    theme,
    resolvedTheme: theme,
    toggleTheme,
    isTransitioning,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
