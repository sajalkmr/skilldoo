'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import RequestModal from '../../components/SwapRequests/RequestModal'
import { UserProfile, Skill } from '../../types'

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserSkills, setCurrentUserSkills] = useState<{
    offered: Skill[]
    wanted: Skill[]
  }>({ offered: [], wanted: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [requestModal, setRequestModal] = useState<{
    isOpen: boolean
    targetUser: UserProfile | null
  }>({ isOpen: false, targetUser: null })
  
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  useEffect(() => {
    if (userId) {
      checkAuth()
      fetchUser()
    }
  }, [userId])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData))
      await fetchCurrentUserSkills()
    }
  }

  const fetchCurrentUserSkills = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUserSkills({
          offered: data.user.offeredSkills || [],
          wanted: data.user.wantedSkills || []
        })
      }
    } catch (error) {
      console.error('Error fetching user skills:', error)
    }
  }

  const fetchUser = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/users/${userId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('User not found')
          router.push('/')
          return
        }
        throw new Error('Failed to fetch user')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user profile')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestClick = () => {
    if (!currentUser) {
      toast.error('Please sign in to send requests')
      router.push('/login')
      return
    }

    if (currentUserSkills.offered.length === 0) {
      toast.error('Please add some skills you offer before sending requests')
      router.push('/profile/edit')
      return
    }

    if (user) {
      setRequestModal({
        isOpen: true,
        targetUser: user
      })
    }
  }

  const closeRequestModal = () => {
    setRequestModal({
      isOpen: false,
      targetUser: null
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const isCurrentUser = currentUser?.id === user.id

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {user.profilePhoto && !imageError ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-3xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  {user.location && (
                    <p className="text-gray-600 text-lg">{user.location}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {currentUser && !isCurrentUser && (
                <button
                  onClick={handleRequestClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Send Request
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Skills Offered
                </h2>
                {user.offeredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.offeredSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills offered yet</p>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Skills Wanted
                </h2>
                {user.wantedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.wantedSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills wanted yet</p>
                )}
              </div>
            </div>
            
            {!currentUser && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-center">
                  <span className="font-medium">Want to connect with {user.name}?</span>
                  <br />
                  <a href="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </a>
                  {' '}or{' '}
                  <a href="/register" className="text-blue-600 hover:underline">
                    create an account
                  </a>
                  {' '}to send a swap request.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {requestModal.isOpen && requestModal.targetUser && (
        <RequestModal
          isOpen={requestModal.isOpen}
          onClose={closeRequestModal}
          targetUser={requestModal.targetUser}
          currentUserSkills={currentUserSkills}
        />
      )}
    </Layout>
  )
} 