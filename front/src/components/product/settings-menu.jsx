"use client"

import { useState } from "react"
import { Settings, Moon, Sun, LogOut } from "lucide-react"

import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

export function SettingsMenu({ isOpen, onClose, user }) {
  
  const navigate = useNavigate();

  // Editable fields
  const [dietaryPreferences, setDietaryPreferences] = useState(user?.dietaryPreferences?.join(", ") || "");
  const [allergies, setAllergies] = useState(user?.allergies?.join(", ") || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    onClose();
    window.location.href = '/';
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch("http://localhost:3000/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dietaryPreferences: dietaryPreferences.split(',').map(s => s.trim()).filter(Boolean),
          allergies: allergies.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save preferences");
      toast.success("Preferences updated!");
    } catch (e) {
      toast.error(e.message || "Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-lg relative z-[102]">
        {/* Header */}
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
                <button
                  className="mt-4 w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  onClick={() => { onClose(); navigate('/change-password'); }}
                >
                  Change Password
                </button>
              </div>
            )}

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium mb-3">Preferences</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Dietary Preferences</label>
                <input
                  type="text"
                  value={dietaryPreferences}
                  onChange={e => setDietaryPreferences(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. vegetarian, vegan, keto"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. peanuts, gluten, dairy"
                />
              </div>
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>

            

            {/* Logout Button */}
            <div className="pt-4">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full p-3 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
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

