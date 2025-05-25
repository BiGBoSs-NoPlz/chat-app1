"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Chat {
  _id: string
  name?: string
  type: 'private' | 'group'
  participants: any[]
  lastMessage?: {
    content: string
    createdAt: string
  }
}

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'offline'
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Fetch chats and friends
    const fetchData = async () => {
      try {
        const [chatsRes, friendsRes] = await Promise.all([
          fetch("/api/chats", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("/api/users/friends", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!chatsRes.ok || !friendsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [chatsData, friendsData] = await Promise.all([
          chatsRes.json(),
          friendsRes.json()
        ])

        setChats(chatsData)
        setFriends(friendsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const handleNewGroup = () => {
    router.push("/chat/new-group")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-gray-700"
              onClick={() => router.push("/profile")}
            >
              My Profile
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-400 hover:bg-gray-700 hover:text-red-300"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Chats List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Chats</h2>
              <Button
                size="sm"
                onClick={handleNewGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                New Group
              </Button>
            </div>

            {loading ? (
              <div className="text-gray-400 text-center">Loading...</div>
            ) : (
              filteredChats.map((chat) => (
                <Card
                  key={chat._id}
                  className="p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleChatSelect(chat._id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={chat.type === 'group' ? chat.avatar : chat.participants[0]?.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {chat.name?.[0] || chat.participants[0]?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {chat.name || chat.participants[0]?.name}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-400 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Online Friends */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Online Friends</h2>
              <div className="space-y-3">
                {friends
                  .filter(friend => friend.status === 'online')
                  .map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback className="bg-green-600 text-white">
                            {friend.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
                      </div>
                      <span className="text-sm text-white">{friend.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
