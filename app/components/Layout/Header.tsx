'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        // Fetch latest user data from API to get current role
        const response = await fetch('/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const updatedUser = data.user
          setUser(updatedUser)
          // Update localStorage with latest user data including role
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } else {
          // If API call fails, use cached data
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        // If API call fails, use cached data
        setUser(JSON.parse(userData))
      }
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Skilldoo
            </Link>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Skilldoo
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link 
                  href="/requests" 
                  className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  Swap Requests
                </Link>
                <Link 
                  href="/profile/edit" 
                  className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  Edit Profile
                </Link>
                <span className="text-gray-600">
                  Welcome, {user.name || user.email}
                  {user.role === 'admin' && <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Admin</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/register" 
                  className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
                <Link 
                  href="/login" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 