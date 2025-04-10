"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, MapPin, Edit, Save, Camera } from "lucide-react"

export function UserProfile({ isOpen, onClose, user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    location: user?.location || 'Not specified',
    joinDate: user?.joinDate || new Date().toLocaleDateString(),
    dietaryPreferences: user?.dietaryPreferences || [],
    allergies: user?.allergies || [],
    savedProducts: user?.savedProducts || 0,
    scanHistory: user?.scanHistory || 0,
  })

  const [editForm, setEditForm] = useState({ ...userData })

  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username,
        email: user.email,
        location: user.location || 'Not specified',
        joinDate: user.joinDate || new Date().toLocaleDateString(),
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
        savedProducts: user.savedProducts || 0,
        scanHistory: user.scanHistory || 0,
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({ ...userData })
  }

  const handleSave = () => {
    setUserData({ ...editForm })
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 overflow-y-auto bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-border flex justify-between items-center bg-background">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-accent">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold">User Profile</h2>
          </div>

          {/* Edit/Save Button */}
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto p-4">
          {/* Profile header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {userData.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            {!isEditing ? (
              <h3 className="text-xl font-bold">{userData.username}</h3>
            ) : (
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleChange}
                className="text-xl font-bold text-center bg-transparent border-b border-border focus:outline-none focus:border-primary"
              />
            )}

            <p className="text-muted">Member since {userData.joinDate}</p>
          </div>

          {/* User information */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Contact Information</h4>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted" />
                {!isEditing ? (
                  <span>{userData.email}</span>
                ) : (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b border-border focus:outline-none focus:border-primary"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted" />
                {!isEditing ? (
                  <span>{userData.location}</span>
                ) : (
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-b border-border focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Dietary preferences */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Dietary Preferences</h4>

            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {userData.dietaryPreferences.map((pref, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted">Enter preferences separated by commas</p>
                <input
                  type="text"
                  name="dietaryPreferences"
                  value={editForm.dietaryPreferences.join(", ")}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dietaryPreferences: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2 bg-transparent border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Allergies</h4>

            {!isEditing ? (
              <div className="flex flex-wrap gap-2">
                {userData.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted">Enter allergies separated by commas</p>
                <input
                  type="text"
                  name="allergies"
                  value={editForm.allergies.join(", ")}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      allergies: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full p-2 bg-transparent border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {/* Activity stats */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Activity</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/10">
                <p className="text-sm text-muted mb-1">Saved Products</p>
                <p className="text-2xl font-bold">{userData.savedProducts}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/10">
                <p className="text-sm text-muted mb-1">Scan History</p>
                <p className="text-2xl font-bold">{userData.scanHistory}</p>
              </div>
            </div>
          </div>

          {/* Account actions */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Account</h4>

            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent">
                Change Password
              </button>

              <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent">
                Export My Data
              </button>

              <button className="w-full p-3 text-left text-destructive border border-destructive rounded-lg hover:bg-destructive/10">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

