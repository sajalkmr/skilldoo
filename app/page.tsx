'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import UserGrid from './components/Users/UserGrid'
import SearchFilters from './components/Users/SearchFilters'
import Pagination from './components/Common/Pagination'
import RequestModal from './components/SwapRequests/RequestModal'
import { UserProfile, Skill } from './types'

export default function Home() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentUserSkills, setCurrentUserSkills] = useState<{
    offered: Skill[]
    wanted: Skill[]
  }>({ offered: [], wanted: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [requestModal, setRequestModal] = useState<{
    isOpen: boolean
    targetUser: UserProfile | null
  }>({ isOpen: false, targetUser: null })
  
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchUsers()
  }, [])

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

  const fetchUsers = async (page = 1, search = '') => {
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search })
      })

      const response = await fetch(`/api/users/browse?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers(1, '')
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchUsers(page, searchQuery)
  }

  const handleRequestClick = (user: UserProfile) => {
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

    setRequestModal({
      isOpen: true,
      targetUser: user
    })
  }

  const closeRequestModal = () => {
    setRequestModal({
      isOpen: false,
      targetUser: null
    })
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover <span className="text-purple-600">Skilled</span> People
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find people who can teach you new skills and share your expertise with others.
            </p>
          </div>

          <SearchFilters
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            searchQuery={searchQuery}
            isLoading={isLoading}
          />

          <UserGrid
            users={users}
            currentUserId={currentUser?.id}
            isLoading={isLoading}
            onRequestClick={handleRequestClick}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            isLoading={isLoading}
          />

          {requestModal.isOpen && requestModal.targetUser && (
            <RequestModal
              isOpen={requestModal.isOpen}
              onClose={closeRequestModal}
              targetUser={requestModal.targetUser}
              currentUserSkills={currentUserSkills}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
