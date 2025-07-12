'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell, User, Settings, LogOut, Menu, X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/components/NotificationDropdown';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = {
    name: 'John Developer',
    email: 'john@example.com',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    reputation: 1247
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StackIt</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {['/', '/ask-question', '/tags', '/users'].map((path, i) => (
              <Link key={i} href={path} className="text-gray-600 hover:text-gray-900 transition-colors">
                {['Questions', 'Ask Question', 'Tags', 'Users'][i]}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center p-2 gap-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="text-xs">{user.reputation} reputation</Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {['/profile', '/settings', '/admin'].map((href, i) => (
                      <DropdownMenuItem key={i} asChild>
                        <Link href={href} className="flex items-center">
                          {[<User />, <Settings />, <Settings />][i]} <span className="ml-2">{['Profile', 'Settings', 'Admin'][i]}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsLoggedIn(false)} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>Log in</Button>
                <Button onClick={() => setIsLoggedIn(true)}>Sign up</Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button variant="ghost" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 py-4 flex flex-col space-y-2">
            {['/', '/ask-question', '/tags', '/users'].map((path, i) => (
              <Link
                key={i}
                href={path}
                className="text-gray-600 hover:text-gray-900 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {['Questions', 'Ask Question', 'Tags', 'Users'][i]}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
