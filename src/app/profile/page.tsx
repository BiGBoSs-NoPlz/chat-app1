"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })

        if (!res.ok) throw new Error("Failed to fetch profile")

        const data = await res.json()
        setUser(data)
        setName(data.name)
        setPreviewUrl(data.avatar || "")
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
      }
    }

    fetchProfile()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Upload new avatar if selected
      let avatarUrl = user?.avatar || ""
      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: formData
        })

        if (!uploadRes.ok) throw new Error("Failed to upload avatar")

        const uploadData = await uploadRes.json()
        avatarUrl = uploadData.fileUrl
      }

      // Update profile
      const updateData: any = { name, avatar: avatarUrl }
      
      // Add password update if provided
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match")
        }
        updateData.currentPassword = currentPassword
        updateData.newPassword = newPassword
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update profile")
      }

      setSuccess("Profile updated successfully")
      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
              <Input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                value={user.email}
                disabled
                className="bg-gray-700 border-gray-600 text-white opacity-70"
              />
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Change Password</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            {success && (
              <div className="text-green-500 text-sm">{success}</div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-white hover:bg-gray-700"
                onClick={() => router.push("/chat")}
              >
                Back to Chat
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
