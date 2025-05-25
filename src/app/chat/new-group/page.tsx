"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

export default function NewGroupPage() {
  const router = useRouter()
  const [groupName, setGroupName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [friends, setFriends] = useState<User[]>([])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/users/friends", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })

        if (!res.ok) throw new Error("Failed to fetch friends")

        const data = await res.json()
        setFriends(data)
      } catch (error) {
        console.error("Error fetching friends:", error)
        setError("Failed to load friends list")
      }
    }

    fetchFriends()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFriends.length < 2) {
      setError("Please select at least 2 members for the group")
      return
    }

    setLoading(true)
    setError("")

    try {
      // First upload the avatar if selected
      let avatarUrl = ""
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

      // Create the group
      const res = await fetch("/api/chats/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: groupName,
          participants: selectedFriends,
          avatar: avatarUrl
        })
      })

      if (!res.ok) throw new Error("Failed to create group")

      const data = await res.json()
      router.push(`/chat/${data._id}`)
    } catch (error) {
      console.error("Error creating group:", error)
      setError("Failed to create group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-white">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-white">Group Avatar (Optional)</Label>
              <div className="flex items-center space-x-4">
                {previewUrl && (
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback>IMG</AvatarFallback>
                  </Avatar>
                )}
                <Input
                  id="avatar"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Select Members (minimum 2)</Label>
              <ScrollArea className="h-64 border rounded-md border-gray-700 p-4">
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700"
                    >
                      <Checkbox
                        id={friend._id}
                        checked={selectedFriends.includes(friend._id)}
                        onCheckedChange={() => handleFriendToggle(friend._id)}
                      />
                      <Avatar>
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {friend.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Label
                        htmlFor={friend._id}
                        className="text-white cursor-pointer flex-1"
                      >
                        {friend.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-white hover:bg-gray-700"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
