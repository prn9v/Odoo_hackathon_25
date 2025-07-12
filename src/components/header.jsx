"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, User, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, message: "Someone answered your question", time: "2 min ago" },
    { id: 2, message: "Your answer was accepted", time: "1 hour ago" },
    { id: 3, message: "New comment on your answer", time: "3 hours ago" }
  ])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            StackIt
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/questions" className="text-gray-700 hover:text-gray-900">
              Questions
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-gray-900">
              Tags
            </Link>
            <Link href="/users" className="text-gray-700 hover:text-gray-900">
              Users
            </Link>
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                </div>
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-3">
                    <div>
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>My Profile</DropdownMenuItem>
                <DropdownMenuItem>My Questions</DropdownMenuItem>
                <DropdownMenuItem>My Answers</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 hover:text-gray-900 px-2 py-1">
                Home
              </Link>
              <Link href="/questions" className="text-gray-700 hover:text-gray-900 px-2 py-1">
                Questions
              </Link>
              <Link href="/tags" className="text-gray-700 hover:text-gray-900 px-2 py-1">
                Tags
              </Link>
              <Link href="/users" className="text-gray-700 hover:text-gray-900 px-2 py-1">
                Users
              </Link>
              <div className="flex items-center justify-between px-2 py-1">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge className="ml-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>
              <Button className="mx-2 bg-blue-600 hover:bg-blue-700">Login</Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
