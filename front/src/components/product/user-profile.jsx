"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, MapPin, Edit, Save, Camera, Shield, Download, Lock } from "lucide-react"
import { ChangePassword } from "../auth/ChangePassword"
import { toast } from "react-toastify"

export function UserProfile({ isOpen, onClose, user }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
      setEditForm({
        username: user.username,
        email: user.email,
        location: user.location || 'Not specified',
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
      })
    }
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({ ...userData })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("http://localhost:3000/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          location: editForm.location,
          dietaryPreferences: editForm.dietaryPreferences,
          allergies: editForm.allergies,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences")
      }

      setUserData(prev => ({
        ...prev,
        location: data.user.location,
        dietaryPreferences: data.user.dietaryPreferences,
        allergies: data.user.allergies,
      }))

      // Update the user in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        location: data.user.location,
        dietaryPreferences: data.user.dietaryPreferences,
        allergies: data.user.allergies,
      }))

      setIsEditing(false)
      toast.success("Preferences updated successfully")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative min-h-screen md:flex md:items-center md:justify-center py-10">
        <div className="relative bg-background max-w-4xl mx-auto rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold">User Profile</h2>
            </div>

            {/* Edit/Save Button */}
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 group">
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-4 ring-background">
                    <span className="text-3xl font-bold text-primary">
                      {userData.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <h3 className="text-2xl font-bold text-foreground">{userData.username}</h3>
                ) : (
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleChange}
                    className="text-2xl font-bold text-center bg-transparent border-b-2 border-primary/20 focus:border-primary px-2 py-1 outline-none"
                    placeholder="Your username"
                  />
                )}
                <p className="text-muted-foreground">Member since {userData.joinDate}</p>
              </div>

              {/* Main Content Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h4 className="font-medium text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Information
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Email</label>
                        {!isEditing ? (
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {userData.email}
                          </p>
                        ) : (
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-accent/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Location</label>
                        {!isEditing ? (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {userData.location}
                          </p>
                        ) : (
                          <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-accent/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="rounded-xl border border-border p-6">
                    <h4 className="font-medium text-lg mb-4">Activity Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5">
                        <p className="text-sm text-muted-foreground mb-1">Saved Products</p>
                        <p className="text-2xl font-bold text-primary">{userData.savedProducts}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5">
                        <p className="text-sm text-muted-foreground mb-1">Scan History</p>
                        <p className="text-2xl font-bold text-primary">{userData.scanHistory}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Dietary Preferences */}
                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h4 className="font-medium text-lg">Dietary Preferences</h4>
                    
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
                        <p className="text-sm text-muted-foreground">Enter preferences separated by commas</p>
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
                          className="w-full px-3 py-2 bg-accent/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h4 className="font-medium text-lg">Allergies & Restrictions</h4>
                    
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
                        <p className="text-sm text-muted-foreground">Enter allergies separated by commas</p>
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
                          className="w-full px-3 py-2 bg-accent/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h4 className="font-medium text-lg">Account Actions</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowChangePassword(true)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent rounded-lg transition-colors"
                      >
                        <Lock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">Update your security credentials</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
                        <Download className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Export Data</p>
                          <p className="text-sm text-muted-foreground">Download your data in JSON format</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-3 text-left text-destructive hover:bg-destructive/5 rounded-lg transition-colors">
                        <Shield className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm opacity-70">Permanently remove your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}

