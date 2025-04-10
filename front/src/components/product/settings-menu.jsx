"use client"

import { useState } from "react"
import { Settings, Bell, Moon, Sun, Globe, Lock, Shield, LogOut, Info } from "lucide-react"
import { useTheme } from "next-themes"

export function SettingsMenu({ isOpen, onClose, user }) {
  const { theme, setTheme } = useTheme()
  const isDarkTheme = theme === "dark"

  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("english")
  const [openaiApiKey, setOpenaiApiKey] = useState("")

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('user');
    // Close settings menu
    onClose();
    // Redirect will be handled by parent
    window.location.href = '/';
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-6">
            {/* User Section */}
            {user && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Account</h3>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-semibold">{user.username[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Theme */}
            <div>
              <h3 className="text-lg font-medium mb-3">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkTheme ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>Dark Mode</span>
                </div>
                <button
                  onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${isDarkTheme ? "bg-green-600" : "bg-gray-200"}`}
                >
                  <span className="sr-only">Toggle dark mode</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDarkTheme ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-medium mb-3">Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Push Notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications ? "bg-green-600" : "bg-gray-200"}`}
                >
                  <span className="sr-only">Toggle notifications</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <h3 className="text-lg font-medium mb-3">Language</h3>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5" />
                <span>Select Language</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>

            {/* API Settings */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                API Settings
                <div className="relative group">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                    The OpenAI API key is required for the AI-powered ingredient analysis. This allows NutriScan to
                    generate health ratings and detailed nutritional insights.
                  </div>
                </div>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <span>OpenAI API Key</span>
                </div>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500">
                  Required for AI-powered analysis. Get your key at{" "}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    className="text-green-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenAI
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h3 className="text-lg font-medium mb-3">Privacy & Security</h3>
              <div className="space-y-3">
                <button className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Policy</span>
                </button>
                <button className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  <Shield className="h-5 w-5" />
                  <span>Terms of Service</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                  <span className="text-red-500">Log Out</span>
                </button>
              </div>
            </div>

            <div className="pt-4 text-center text-sm text-gray-500">
              <p>NutriScan v1.0.0</p>
              <p>© 2025 NutriScan. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

