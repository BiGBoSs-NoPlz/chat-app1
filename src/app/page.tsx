import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Modern Chat Application
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect with friends and colleagues through instant messaging, group chats, and file sharing. Experience real-time communication with a modern, secure platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Real-time Messaging */}
            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-900">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold">Real-time Messaging</h3>
              <p className="text-gray-400">
                Instant message delivery with real-time updates and typing indicators
              </p>
            </div>

            {/* Group Chats */}
            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-900">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold">Group Chats</h3>
              <p className="text-gray-400">
                Create and manage group conversations with multiple participants
              </p>
            </div>

            {/* File Sharing */}
            <div className="space-y-4 text-center p-6 rounded-lg bg-gray-900">
              <div className="text-4xl mb-4">📎</div>
              <h3 className="text-xl font-semibold">File Sharing</h3>
              <p className="text-gray-400">
                Share images, documents, and other files securely with your contacts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Secure Communication</h2>
          <p className="text-gray-400 text-lg">
            Your privacy and security are our top priorities. All messages and files are encrypted, and our platform follows the latest security best practices.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-lg bg-gray-800">
              <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-400">
                Your messages are encrypted and can only be read by intended recipients
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800">
              <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-gray-400">
                Multi-factor authentication and secure password policies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Chat Application. All rights reserved.</p>
            <div className="mt-4 space-x-4">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
