"use client"

import { useState } from "react"
import type React from "react"
import { motion } from "framer-motion"
import { Home, Settings, Bell, User, GitCompare, ScanLine, BarChart3, PlusCircleIcon, ChevronRight } from "lucide-react"
<<<<<<< HEAD
import { useTheme } from "../ui/theme-context"
=======

>>>>>>> 6d8d39db299e4999a3247f320435b03502378059
import { BarcodeScanner } from "./BarcodeScanner"
import { SettingsMenu } from "../product/settings-menu"
import { UserProfile } from "../product/user-profile"

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  gradient: string
  iconColor: string
  action?: () => void
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export function MenuBar({ user }: { user?: any }) {
 
  const [showScanner, setShowScanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null)

  const handleBarcodeDetected = (barcode: string) => {
    setDetectedBarcode(barcode)
    setShowScanner(false)
  }

  const handleSettingsClick = () => {
    setShowSettingsPopup(true)
  }

  const handleSettingsClose = () => {
    setShowSettingsPopup(false)
    setShowSettings(false)
    setShowProfile(false)
  }

  const openSettings = () => {
    setShowSettings(true)
    setShowSettingsPopup(false)
  }

  const openProfile = () => {
    setShowProfile(true)
    setShowSettingsPopup(false)
  }

  

  const menuItems: MenuItem[] = [
    {
      icon: <Home className="h-4 w-4 transition-colors duration-300" />,
      label: "Home",
      href: "#top",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "blue-500",
    },
    {
      icon: <ScanLine className="h-4 w-4 transition-colors duration-300" />,
      label: "Scan",
      href: "#",
      gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
      iconColor: "orange-500",
      action: () => setShowScanner(true),
    },
    {
      icon: <BarChart3 className="h-4 w-4 transition-colors duration-300" />,
      label: "Analysis",
      href: "#details",
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "green-500",
    },
    {
      icon: <GitCompare className="h-4 w-4 transition-colors duration-300" />,
      label: "Alternatives",
      href: "#alternatives",
      gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "red-900",
    },
    {
      icon: <PlusCircleIcon className="h-4 w-4 transition-colors duration-300" />,
      label: "Contribute",
      href: "#contribute",
      gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "yellow-500",
    },
    {
      icon: <Settings className="h-4 w-4 transition-colors duration-300" />,
      label: "Settings",
      href: "",
      gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "yellow-500",
      action: handleSettingsClick,
    },
  ]

  return (
    <>
      <motion.nav
        className="md:hidden border-1 border-gray-600 rounded-b-full fixed top-1 left-1 right-1 z-40 p-1 bg-white/5 backdrop-blur-lg shadow-md"
        initial="initial"
        whileHover="hover"
      >
        <motion.div
          className="absolute -inset-2 bg-gradient-radial from-blue-400/20 via-purple-400/20 to-red-400/20 rounded-3xl z-0 pointer-events-none"
          variants={navGlowVariants}
        />
        <ul className="flex items-center justify-between relative z-10 px-1 py-0.5 mx-auto container max-w-sm">
          {menuItems.map((item) => (
            <motion.li key={item.label} className="relative">
              <motion.div
                className="block rounded-xl overflow-visible group relative"
                style={{ perspective: "600px" }}
                whileHover="hover"
                initial="initial"
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none"
                  variants={glowVariants}
                  style={{
                    background: item.gradient,
                    opacity: 0,
                    borderRadius: "16px",
                  }}
                />
                <motion.a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    if (item.action) {
                      item.action()
                    } else if (item.href) {
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 px-1.5 py-1 relative z-10 bg-transparent text-muted-foreground group-hover:text-amber-300 transition-colors rounded-lg min-w-[40px]"
                  variants={itemVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                >                  <span className={`text-white/50 ${
                    item.label === "Home" ? "group-hover:text-blue-500" :
                    item.label === "Scan" ? "group-hover:text-orange-500" :
                    item.label === "Analysis" ? "group-hover:text-green-500" :
                    item.label === "Alternatives" ? "group-hover:text-red-900" :
                    "group-hover:text-yellow-500"
                  }`}>
                    {item.icon}
                  </span>
                  <span className="text-white/35 text-[10px]">{item.label}</span>
                </motion.a>                  <motion.a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    if (item.action) {
                      item.action()
                    } else if (item.href) {
                      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex flex-col items-center gap-0.5 px-1.5 py-1 absolute inset-0 z-10 bg-transparent text-muted-foreground transition-colors rounded-lg min-w-[40px]"
                  variants={backVariants}
                  transition={sharedTransition}
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                >                  <span className={`text-white/50 ${
                    item.label === "Home" ? "group-hover:text-blue-500" :
                    item.label === "Scan" ? "group-hover:text-orange-500" :
                    item.label === "Analysis" ? "group-hover:text-green-500" :
                    item.label === "Alternatives" ? "group-hover:text-red-900" :
                    "group-hover:text-yellow-500"
                  }`}>
                    {item.icon}
                  </span>
                  <span className="text-white text-[10px]">{item.label}</span>
                </motion.a>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* Settings Popup */}
      {showSettingsPopup && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSettingsClose} />
          <div className="relative bg-background p-4 rounded-t-2xl sm:rounded-xl w-full max-w-xs mx-auto">
            <div className="space-y-2">
              <button
                onClick={openSettings}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={openProfile}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <div className={`fixed inset-0 z-[100] ${showScanner ? 'block' : 'hidden'}`}>
        {showScanner && (
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsMenu
          isOpen={showSettings}
          onClose={handleSettingsClose}
          user={user}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile
          isOpen={showProfile}
          onClose={handleSettingsClose}
          user={user}
        />
      )}
    </>
  )
}
