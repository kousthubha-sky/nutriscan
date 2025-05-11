import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "../ui/theme-context"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
            isDark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          }`}
        >
          <Sun className="w-5 h-5 text-yellow-500" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
            isDark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          }`}
        >
          <Moon className="w-5 h-5 text-purple-500" />
        </span>
      </div>
    </button>
  )
}
