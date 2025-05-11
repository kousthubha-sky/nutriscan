import { createContext, useState, useEffect, useContext } from "react"

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const stored = localStorage.getItem("theme")
    if (stored) return stored

    // If no stored preference, check system preference
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    
    return defaultTheme
  })

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateTheme = (newTheme) => {
      if (newTheme === "system") {
        // For system theme, follow OS preference
        const isDark = mediaQuery.matches
        root.classList.toggle("dark", isDark)
      } else {
        // For explicit theme choice
        root.classList.toggle("dark", newTheme === "dark")
      }
    }

    // Set initial theme
    updateTheme(theme)

    // Store theme preference
    if (theme !== "system") {
      localStorage.setItem("theme", theme)
    }

    // Listen for system theme changes
    const systemThemeListener = () => {
      if (theme === "system") {
        updateTheme("system")
      }
    }
    mediaQuery.addListener(systemThemeListener)

    return () => mediaQuery.removeListener(systemThemeListener)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme)
      if (newTheme !== "system") {
        localStorage.setItem("theme", newTheme)
      }
    }
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
