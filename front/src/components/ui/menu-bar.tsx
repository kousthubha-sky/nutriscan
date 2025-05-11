import * as React from "react"
import { motion } from "framer-motion"
import { Home, ScanLine, BarChart2, GitCompare, PlusCircle } from "lucide-react"
import { useTheme } from "next-themes"

type IconComponent = React.ComponentType<{ className?: string }>

interface MenuItem {
  Icon: IconComponent
  label: string
  href: string
  gradient: string
  iconColor: string
}

const menuItems: MenuItem[] = [
  {
    Icon: Home,
    label: "Home",
    href: "#top",
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    Icon: ScanLine,
    label: "Scan",
    href: "#",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    Icon: BarChart2,
    label: "Food Analysis",
    href: "#details",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    Icon: GitCompare,
    label: "Alternatives",
    href: "#alternatives",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
  {
    Icon: PlusCircle,
    label: "Add Product",
    href: "#contribute",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
]

const itemVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  tap: { scale: 0.95 },
}

const MenuItem = ({ item }: { item: MenuItem }) => {
  const { Icon } = item
  
  return (
    <motion.li className="relative flex-1">
      <motion.div
        className="block relative"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
      >
        <a
          href={item.href}
          className="flex flex-col items-center gap-1 px-3 py-1.5 relative z-10 bg-transparent text-muted-foreground group-hover:text-amber-300 transition-colors rounded-xl min-w-[60px]"
        >
          <Icon className={`h-5 w-5 ${item.iconColor}`} />
          <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
        </a>
      </motion.div>
    </motion.li>
  )
}

export function MenuBar() {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  return (
    <motion.nav
      className="md:hidden fixed top-0 left-0 right-0 z-50 p-2 mb-2 bg-white/10 backdrop-blur-lg shadow-md overflow-x-auto overflow-y-hidden"
      initial="initial"
      animate="animate"
    >
      <ul className="flex items-center gap-2 relative z-10 px-2 py-1 mx-auto max-w-screen-xl justify-between">
        {menuItems.map((item) => (
          <MenuItem key={item.label} item={item} />
        ))}
      </ul>
    </motion.nav>
  )
}
