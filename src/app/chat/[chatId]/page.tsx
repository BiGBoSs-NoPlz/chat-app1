"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import io, { Socket } from "socket.io-client"

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  type: 'text' | 'image' | 'file' | 'video'
  fileUrl?: string
  fileName?: string
  createdAt: string
}

interface Chat {
  _id: string
  name?: string
  type: 'private' | 'group'
  participants: {
    _id: string
    name: string
    avatar?: string
    status: 'online' | 'offline'
  }[]
}

export default function ChatRoom() {
  const params = useParams()
  const chatId = params.chatId as string
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    // Get user ID from token
    const payload = JSON.parse(atob(token.split(".")[1]))
    setUserId(payload.userId)

    // Connect to Socket.IO
    const newSocket = io("http://localhost:3001", {
      auth: { token }
    })

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO")
      newSocket.emit("joinRoom", chatId)
    })

    newSocket.on("message", (message: Message) => {
      setMessages(prev => [...prev, message])
      scrollToBottom()
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit("leaveRoom", chatId)
      newSocket.close()
    }
  }, [chatId])

  useEffect(() => {
    const fetchChatAndMessages = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const [chatRes, messagesRes] = await Promise.all([
          fetch(`/api/chats/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/messages/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (!chatRes.ok || !messagesRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [chatData, messagesData] = await Promise.all([
          chatRes.json(),
          messagesRes.json()
        ])

        setChat(chatData)
        setMessages(messagesData)
        scrollToBottom()
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatAndMessages()
  }, [chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    try {
      socket.emit("sendMessage", {
        chatId,
        content: newMessage,
        type: "text"
      })
      
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !socket) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      })

      if (!res.ok) throw new Error("Upload failed")

      const { fileUrl, fileName } = await res.json()

      socket.emit("sendMessage", {
        chatId,
        content: fileName,
        type: file.type.startsWith("image/") ? "image" : "file",
        fileUrl,
        fileName,
        fileSize: file.size
      })
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white">Chat not found</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={chat.type === 'group' ? undefined : chat.participants[0]?.avatar} />
          <AvatarFallback className="bg-blue-600 text-white">
            {chat.name?.[0] || chat.participants[0]?.name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {chat.name || chat.participants[0]?.name}
          </h2>
          <p className="text-sm text-gray-400">
            {chat.type === 'group' 
              ? `${chat.participants.length} members`
              : chat.participants[0]?.status === 'online' ? 'Online' : 'Offline'
            }
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[70%] p-3 ${
                message.sender._id === userId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-white'
              }`}>
                {message.type === 'text' ? (
                  <p>{message.content}</p>
                ) : message.type === 'image' ? (
                  <img 
                    src={message.fileUrl} 
                    alt={message.fileName}
                    className="max-w-full rounded"
                  />
                ) : (
                  <a 
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-300 hover:text-blue-200"
                  >
                    <span>📎</span>
                    <span>{message.fileName}</span>
                  </a>
                )}
                <div className="mt-1 text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            type="button"
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            📎
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}
