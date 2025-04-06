import { useState, useEffect } from "react"
import { Home, ScanLine, BarChart2, GitCompare, PlusCircle, Settings, LogOut, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"

const menuItems = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "#top",
    section: "top",
    action: null,
  },
  {
    icon: <ScanLine className="h-5 w-5" />,
    label: "Scan Product",
    href: "#",
    section: null,
    action: "scan", // This will be used to trigger the scanner
  },
  {
    icon: <BarChart2 className="h-5 w-5" />,
    label: "Food Analysis",
    href: "#details",
    section: "details",
    action: null,
  },
  {
    icon: <GitCompare className="h-5 w-5" />,
    label: "Alternatives",
    href: "#alternatives",
    section: "alternatives",
    action: null,
  },
  {
    icon: <PlusCircle className="h-5 w-5" />,
    label: "Add Product",
    href: "#contribute",
    section: "contribute",
    action: null,
  },
]

const bottomMenuItems = [
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    href: "#",
    section: null,
    action: "settings", // This will be used to open settings
  },
  {
    icon: <LogOut className="h-5 w-5" />,
    label: "Logout",
    href: "#",
    section: null,
    action: null,
  },
]

export function Sidebar({ onAction }) {
  const [activeSection, setActiveSection] = useState("top")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [isOpen, setIsOpen] = useState(false)

  // Handle menu item click
  const handleMenuItemClick = (e, item) => {
    if (item.action) {
      e.preventDefault()
      onAction(item.action)
    }
  }

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "top", element: document.getElementById("top") },
        { id: "details", element: document.getElementById("details") },
        { id: "ingredients", element: document.getElementById("ingredients") },
        { id: "impact", element: document.getElementById("impact") },
        { id: "alternatives", element: document.getElementById("alternatives") },
        { id: "contribute", element: document.getElementById("contribute") },
        { id: "rating", element: document.getElementById("rating") },
      ]

      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const offsetTop = section.element.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".sidebar")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button - moved to right corner */}
      <button
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`sidebar ${isOpen ? "open" : ""} w-64 h-screen flex flex-col 
          border-l border-gray-200/10 
          ${isDarkTheme ? "border-gray-800/10" : "border-gray-200/20"} 
          fixed md:static right-0 top-0 z-30 bg-background`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200/10 dark:border-gray-800/10 flex items-center gap-2">
          <div
            className={`h-8 w-8 flex items-center justify-center rounded ${
              isDarkTheme ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <span className="font-bold text-lg">NS</span>
          </div>
          <span className="font-bold text-xl text-green-600">NutriScan</span>
        </div>

        {/* Main menu */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 mb-4">MAIN MENU</p>
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleMenuItemClick(e, item)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      item.section && activeSection === item.section
                        ? `${isDarkTheme ? "bg-green-900/20 text-green-500" : "bg-green-50 text-green-600"}`
                        : `hover:${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} text-gray-600 hover:text-gray-900`
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs">User</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
          <nav>
            <ul className="space-y-1">
              {bottomMenuItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleMenuItemClick(e, item)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:${
                      isDarkTheme ? "bg-gray-800" : "bg-gray-100"
                    } text-gray-600 hover:text-gray-900`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

