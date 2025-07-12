'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Layout from '../components/Layout/Layout'
import Pagination from '../components/Common/Pagination'
import { SwapRequestWithDetails } from '../types'

export default function SwapRequestsPage() {
  const [requests, setRequests] = useState<SwapRequestWithDetails[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SwapRequestWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })
  
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchRequests()
    }
  }, [currentUser, filter, pagination.page])

  useEffect(() => {
    applyFilters()
  }, [requests, searchQuery, filter])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    setCurrentUser(JSON.parse(userData))
  }

  const fetchRequests = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const params = new URLSearchParams({
        type: 'all',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const response = await fetch(`/api/swaps?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data.swapRequests || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load swap requests')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...requests]

    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'pending') {
        filtered = filtered.filter(req => req.status === 'pending')
      } else if (filter === 'accepted') {
        filtered = filtered.filter(req => req.status === 'accepted')
      } else if (filter === 'rejected') {
        filtered = filtered.filter(req => req.status === 'rejected')
      } else if (filter === 'completed') {
        filtered = filtered.filter(req => req.status === 'completed')
      } else if (filter === 'incoming') {
        filtered = filtered.filter(req => req.providerId === currentUser?.id)
      } else if (filter === 'outgoing') {
        filtered = filtered.filter(req => req.requesterId === currentUser?.id)
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(req => 
        req.requester.name?.toLowerCase().includes(query) ||
        req.provider.name?.toLowerCase().includes(query) ||
        req.offeredSkill.name.toLowerCase().includes(query) ||
        req.wantedSkill.name.toLowerCase().includes(query) ||
        req.message?.toLowerCase().includes(query)
      )
    }

    setFilteredRequests(filtered)
  }

  const handleStatusUpdate = async (requestId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/swaps/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      toast.success(`Request ${newStatus} successfully`)
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Failed to update request')
    }
  }

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm('Are you sure you want to delete this request?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/swaps/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete request')
      }

      toast.success('Request deleted successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      toast.error('Failed to delete request')
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRequestDirection = (request: SwapRequestWithDetails) => {
    return request.requesterId === currentUser?.id ? 'outgoing' : 'incoming'
  }

  const getOtherUser = (request: SwapRequestWithDetails) => {
    return request.requesterId === currentUser?.id ? request.provider : request.requester
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-40 h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Swap Requests</h1>
          <p className="text-gray-600 mb-6">
            Manage your skill swap requests and connections
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills, or message..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="all">All Requests</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? 'No requests found' : 'No matching requests'}
            </h3>
            <p className="text-gray-500">
              {requests.length === 0 
                ? "You don't have any swap requests yet. Start by browsing users and sending requests!"
                : "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const otherUser = getOtherUser(request)
              const direction = getRequestDirection(request)
              const isIncoming = direction === 'incoming'
              
              return (
                <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          {otherUser.profilePhoto ? (
                            <img
                              src={otherUser.profilePhoto}
                              alt={otherUser.name || 'User'}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-2 border-gray-200">
                              <span className="text-purple-600 font-bold text-lg">
                                {(otherUser.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {otherUser.name || 'Unknown User'}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {isIncoming ? 'Incoming' : 'Outgoing'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 font-medium">
                                {isIncoming ? 'They offer:' : 'You offer:'}
                              </span>
                              <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {request.offeredSkill.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 font-medium">
                                {isIncoming ? 'They want:' : 'You want:'}
                              </span>
                              <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                {request.wantedSkill.name}
                              </span>
                            </div>
                          </div>
                          
                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {new Date(request.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {otherUser.location && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {otherUser.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {request.status === 'pending' && isIncoming && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'accepted')}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px]"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {!isIncoming && (request.status === 'pending' || request.status === 'rejected') && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px]"
                          >
                            Delete
                          </button>
                        )}

                        {request.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'completed')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-[80px]"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  )
} 