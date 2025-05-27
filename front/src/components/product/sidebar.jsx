import { useState, useEffect } from "react"
import { Home, ScanLine, BarChart2, GitCompare, PlusCircle, Settings, LogOut, Menu, X, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { BarcodeScanner } from "../home/BarcodeScanner"


  
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

const adminMenuItem = {
  icon: <ShieldCheck className="h-5 w-5" />,
  label: "Admin Panel",
  href: "/admin",
  section: null,
  action: null,
}

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
  const [isOpen, setIsOpen] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const handleMenuItemClick = (e, item) => {
    if (item.action === 'scan') {
      e.preventDefault()
      setShowScanner(true)
    } else if (item.action) {
      e.preventDefault()
      onAction(item.action)
    }
  }

  const handleBarcodeDetected = (barcode) => {
    setShowScanner(false)
    onAction('barcodeSearch', barcode)
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

  return (    <>
      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`sidebar ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
          w-64 h-screen flex flex-col fixed left-0 top-0 z-[100] 
          bg-gray-900 border-r border-gray-800 
          shadow-lg transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded bg-gray-800">
            <span className="font-bold text-lg text-white">NS</span>
          </div>
          <span className="font-bold text-xl text-green-500">
            <Link to="/" className="flex items-center gap-2 text-green-400">
              NutriScan
            </Link>
          </span>
        </div>

        {/* Main menu */}
        <div className="p-4">
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label} >
                  <a
                    href={item.href}
                    onClick={(e) => handleMenuItemClick(e, item)}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative
                      font-medium
                      ${item.section && activeSection === item.section
                        ? "bg-green-500/20 text-green-500 font-bold"
                        : "text-white hover:bg-white/10 hover:text-white"}`}
                  >
                    <span className={`transition-colors duration-200 ${
                      item.section && activeSection === item.section
                        ? 'text-green-500'
                        : 'text-white group-hover:text-white'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="text-white/45 hover:text-green-500">{item.label}</span>
                  </a>
                </li>
              ))}

              {/* Admin Menu Item */}
              {user?.role === 'admin' && (
                <li key="admin">
                  <Link
                    to={adminMenuItem.href}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative
                      font-medium text-white hover:bg-white/10"
                  >
                    <span className="text-white group-hover:text-white">
                      {adminMenuItem.icon}
                    </span>
                    <span className="text-white/45 hover:text-green-500">{adminMenuItem.label}</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="mt-auto p-4 border-t border-gray-800">
          {user ? (
            <>
              <div 
                className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors"
                onClick={() => onAction('profile')}
              >
                <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-white">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-white">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email || 'user@example.com'}</p>
                </div>
              </div>
              <nav>
                <ul className="space-y-1">
                  {bottomMenuItems.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={(e) => handleMenuItemClick(e, item)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium
                          text-white hover:bg-white/10"
                      >
                        <span className="text-white">
                          {item.icon}
                        </span>
                        <span className="text-white/45 hover:text-green-500">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : (
            <div className="flex flex-col gap-2  ">
              <Link
                to="/login"
                className="w-full text-center py-2 px-3 rounded-lg transition-colors
                   hover:bg-white/10 text-green-500"
              >
                <span className="text-white/40 hover:text-green-700">Login</span>
              </Link>
              <Link
                to="/signup"
                className="w-full text-center py-2 px-3 rounded-lg transition-colors
                  text-white hover:bg-white/10"
              >
                <span className="text-white/40 hover:text-green-700">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}