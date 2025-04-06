"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Pizza, Coffee, Apple, IceCream, Cake, Beef, Carrot, Egg } from "lucide-react"

const foodIcons = [
  {
    icon: <Pizza className="h-6 w-6" />,
    name: "Pizza",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
  {
    icon: <Coffee className="h-6 w-6" />,
    name: "Coffee",
    gradient: "radial-gradient(circle, rgba(180,83,9,0.15) 0%, rgba(146,64,14,0.06) 50%, rgba(120,53,15,0) 100%)",
    iconColor: "text-amber-700",
  },
  {
    icon: <Apple className="h-6 w-6" />,
    name: "Apple",
    gradient: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(185,28,28,0.06) 50%, rgba(153,27,27,0) 100%)",
    iconColor: "text-red-600",
  },
  {
    icon: <IceCream className="h-6 w-6" />,
    name: "Ice Cream",
    gradient: "radial-gradient(circle, rgba(219,39,119,0.15) 0%, rgba(190,24,93,0.06) 50%, rgba(157,23,77,0) 100%)",
    iconColor: "text-pink-600",
  },
  {
    icon: <Cake className="h-6 w-6" />,
    name: "Cake",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: <Beef className="h-6 w-6" />,
    name: "Beef",
    gradient: "radial-gradient(circle, rgba(153,27,27,0.15) 0%, rgba(127,29,29,0.06) 50%, rgba(107,33,33,0) 100%)",
    iconColor: "text-red-800",
  },
  {
    icon: <Carrot className="h-6 w-6" />,
    name: "Carrot",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: <Egg className="h-6 w-6" />,
    name: "Egg",
    gradient: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.06) 50%, rgba(217,119,6,0) 100%)",
    iconColor: "text-yellow-400",
  },
]

const iconVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

const glowVariants = {
  initial: { opacity: 0.5, scale: 0.9 },
  hover: {
    opacity: 1,
    scale: 1.5,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
}

export function FoodIcons() {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <div className="grid grid-cols-4 gap-6 md:grid-cols-8 max-w-3xl mx-auto">
      {foodIcons.map((food) => (
        <motion.div
          key={food.name}
          className="flex flex-col items-center justify-center relative"
          initial="initial"
          whileHover="hover"
        >
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            variants={glowVariants}
            style={{
              background: food.gradient,
              opacity: 0.5,
              borderRadius: "50%",
            }}
          />
          <motion.div
            className={`p-4 rounded-full bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative mb-2 ${isDarkTheme ? "shadow-black/20" : "shadow-black/5"}`}
            variants={iconVariants}
          >
            <span className={`${food.iconColor}`}>{food.icon}</span>
          </motion.div>
          <span className="text-xs font-medium text-foreground">{food.name}</span>
        </motion.div>
      ))}
    </div>
  )
}

