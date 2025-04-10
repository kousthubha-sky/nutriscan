"use client"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure the component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-12 h-12 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
            isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          }`}
        >
          <Sun className="w-6 h-6 text-yellow-500" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
            isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          }`}
        >
          <Moon className="w-6 h-6 text-purple-500" />
        </span>
      </div>
    </button>
  )
}

