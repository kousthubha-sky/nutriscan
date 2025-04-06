"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="flex items-center space-x-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: isDark ? 12 : 0, scale: isDark ? 0.75 : 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Sun className={`h-[1.2rem] w-[1.2rem] ${isDark ? "text-gray-500" : "text-amber-500"}`} />
      </motion.div>
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 ${
          isDark ? "bg-indigo-600 data-[state=checked]:bg-indigo-600" : "bg-green-500 data-[state=checked]:bg-green-500"
        }`}
      />
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: !isDark ? 12 : 0, scale: !isDark ? 0.75 : 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Moon className={`h-[1.2rem] w-[1.2rem] ${!isDark ? "text-gray-500" : "text-indigo-400"}`} />
      </motion.div>
    </div>
  )
}

