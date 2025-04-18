import { useState, useEffect } from "react"
import { Home, ScanLine, BarChart2, GitCompare, PlusCircle, Settings, LogOut, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Link } from "react-router-dom"

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
    action: "scan",
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
    action: "settings",
  },
  {
    icon: <LogOut className="h-5 w-5" />,
    label: "Logout",
    href: "#",
    section: null,
    action: "logout",
  },
]

export function Sidebar({ user, onAction }) {
  const [activeSection, setActiveSection] = useState("top")
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [isOpen, setIsOpen] = useState(false)

  const handleMenuItemClick = (e, item) => {
    if (item.action) {
      e.preventDefault()
      onAction(item.action)
    }
  }

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
      <button
        className="md:hidden fixed top-4 right-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar container */}
      <div
        className={`sidebar ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          w-64 h-screen flex flex-col fixed left-0 top-0 z-30 bg-background
          border-r border-gray-200/10 transition-transform duration-300
          ${isDarkTheme ? "border-gray-800/10" : "border-gray-200/20"}`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200/10 dark:border-gray-800/10 flex items-center gap-2">
          <div
            className={`h-8 w-8 flex items-center justify-center rounded ${
              isDarkTheme ? "bg-gray-700" : "bg-gray-600"
            }`}
          >
            <span className="font-bold text-lg">NS</span>
          </div>
          <span className="font-bold text-xl text-green-600">
            <Link to="/" className="flex items-center gap-2">
              NutriScan
            </Link>
          </span>
        </div>

        {/* Updated Main menu */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-400/50 mb-4">MAIN MENU</p>
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleMenuItemClick(e, item)}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative
                      font-medium
                      ${item.section && activeSection === item.section
                        ? "bg-green-100 dark:bg-green-900/30 text-white/30 dark:text-green-400 font-bold border-l-4 border-green-500"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-green-600 dark:hover:text-green-400 border-l-4 border-transparent"}
                    `}
                  >
                    <span className={`transition-colors duration-200 ${
                      item.section && activeSection === item.section
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 group-hover:text-green-600 dark:text-gray-500 dark:group-hover:text-green-400'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="text-inherit">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          {user ? (
            <>
              <div 
                className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                onClick={() => onAction('profile')}
              >
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email || 'user@example.com'}</p>
                </div>
              </div>
              <nav>
                <ul className="space-y-1">
                  {bottomMenuItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => handleMenuItemClick(e, item)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium
                          hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-green-600 dark:hover:text-green-400`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                className={`w-full text-center py-2 px-3 rounded-lg transition-colors ${
                  isDarkTheme ?  "hover:bg-white text-black" : " hover:bg-gray-900 text-white"
                } text-gray-900 dark:text-white`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`w-full text-center py-2 px-3 rounded-lg transition-colors ${
                  isDarkTheme ? " hover:bg-white text-black" : " hover:bg-gray-900 text-white"
                } text-white`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}