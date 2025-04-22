// FloatingFoodIcons.jsx
import { useEffect, useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Apple,
  Beef,
  Cake,
  Carrot,
  Cherry,
  Coffee,
  Cookie,
  Croissant,
  Egg,
  Fish,
  IceCream,
  CitrusIcon as Lemon,
  Pizza,
  Salad,
  Sandwich,
  Utensils,
  Banana,
  Grape,
} from "lucide-react"
import React from "react"

// Define icon components instead of functions
const iconComponents = [
  <Apple key="apple" />,
  <Beef key="beef" />,
  <Cake key="cake" />,
  <Carrot key="carrot" />,
  <Cherry key="cherry" />,
  <Coffee key="coffee" />,
  <Cookie key="cookie" />,
  <Croissant key="croissant" />,
  <Egg key="egg" />,
  <Fish key="fish" />,
  <IceCream key="icecream" />,
  <Lemon key="lemon" />,
  <Pizza key="pizza" />,
  <Salad key="salad" />,
  <Sandwich key="sandwich" />,
  <Utensils key="utensils" />,
  <Banana key="banana" />,
  <Grape key="grape" />,
]

export function FloatingFoodIcons() {
  const [floatingIcons, setFloatingIcons] = useState([])
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  useEffect(() => {
    // Create floating icons on component mount
    const createFloatingIcons = () => {
      const newIcons = []
      const iconCount = 100 // Number of floating icons

      for (let i = 0; i < iconCount; i++) {
        // Get a random icon from the array
        const iconIndex = Math.floor(Math.random() * iconComponents.length)
        const iconElement = iconComponents[iconIndex]

        // Clone the element with new props
        const icon = React.cloneElement(iconElement, {
          className: "w-full h-full",
          strokeWidth: 1.5,
        })

        newIcons.push({
          id: i,
          x: Math.random() * 100, // Random x position (0-100%)
          y: Math.random() * 100, // Random y position (0-100%)
          size: Math.random() * 16 + 8, // Reduced size (8-24px from 10-30px)
          rotation: Math.random() * 360, // Random rotation (0-360deg)
          icon: icon,
          delay: Math.random() * 5, // Random delay (0-5s)
          duration: Math.random() * 15 + 15, // Reduced duration (15-30s from 20-40s)
        })
      }

      setFloatingIcons(newIcons)
    }

    createFloatingIcons()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className={`absolute ${isDarkTheme ? "text-gray-700" : "text-gray-200"}`}
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
          }}
          initial={{
            opacity: 0.3,
            rotate: icon.rotation,
            filter: "blur(1px)",
          }}
          animate={{
            y: ["0%", "10%", "-10%", "5%", "-5%", "0%"],
            x: ["0%", "5%", "-5%", "10%", "-10%", "0%"],
            opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
            rotate: [icon.rotation, icon.rotation + 10, icon.rotation - 10, icon.rotation + 5, icon.rotation],
            filter: ["blur(1px)", "blur(0.5px)", "blur(1px)"],
          }}
          transition={{
            duration: icon.duration,
            ease: "linear",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            repeat: Number.POSITIVE_INFINITY,
            delay: icon.delay,
          }}
        >
          {icon.icon}
          <div
            className={`absolute inset-0 rounded-full ${
              isDarkTheme ? "bg-blue-500/5" : "bg-purple-500/5"
            } blur-xl -z-10 scale-350 opacity-50`}
          />
        </motion.div>
      ))}
    </div>
  )
}

