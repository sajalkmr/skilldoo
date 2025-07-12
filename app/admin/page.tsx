'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Layout from '../components/Layout/Layout'
import { UserWithStats } from '../types'

type AdminTab = 'overview' | 'users' | 'swaps' | 'skills' | 'messages' | 'reports'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [swaps, setSwaps] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSwapRequests: 0,
    completedSwaps: 0
  })
  
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchTabData()
    }
  }, [currentUser, activeTab])

  const checkAdminAuth = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      toast.error('Admin access required')
      router.push('/')
      return
    }
    
    setCurrentUser(user)
  }

  const fetchTabData = async () => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      switch (activeTab) {
        case 'overview':
        case 'users':
          await fetchUsers()
          break
        case 'swaps':
          await fetchSwaps()
          break
        case 'skills':
          await fetchSkills()
          break
        case 'messages':
          await fetchMessages()
          break
        case 'reports':
          break
      }
    } catch (error) {
      console.error('Error fetching tab data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      ...(searchQuery && { search: searchQuery })
    })

    const response = await fetch(`/api/admin/users?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Failed to fetch users')

    const data = await response.json()
    setUsers(data.users || [])
    
    const totalUsers = data.users.length
    const activeUsers = data.users.filter((u: any) => u.isActive).length
    const totalSwapRequests = data.users.reduce((sum: number, u: any) => sum + u.totalSwapRequests, 0)
    const completedSwaps = data.users.reduce((sum: number, u: any) => sum + u.completedSwaps, 0)
    
    setStats({ totalUsers, activeUsers, totalSwapRequests, completedSwaps })
  }

  const fetchSwaps = async () => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      ...(searchQuery && { search: searchQuery })
    })

    const response = await fetch(`/api/admin/swaps?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Failed to fetch swaps')
    const data = await response.json()
    setSwaps(data.swapRequests || [])
  }

  const fetchSkills = async () => {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      ...(searchQuery && { search: searchQuery })
    })

    const response = await fetch(`/api/admin/skills?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Failed to fetch skills')
    const data = await response.json()
    setSkills(data.skills || [])
  }

  const fetchMessages = async () => {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/admin/messages', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) throw new Error('Failed to fetch messages')
    const data = await response.json()
    setMessages(data.messages || [])
  }

  const handleUserToggle = async (userId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isActive: !isActive })
      })

      if (!response.ok) throw new Error('Failed to update user')
      toast.success(`User ${!isActive ? 'activated' : 'banned'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const handleSwapStatusChange = async (swapId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/swaps', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ swapRequestId: swapId, status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update swap')
      toast.success('Swap status updated successfully')
      fetchSwaps()
    } catch (error) {
      console.error('Error updating swap:', error)
      toast.error('Failed to update swap')
    }
  }

  const handleSkillDelete = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/skills?skillId=${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete skill')
      toast.success('Skill deleted successfully')
      fetchSkills()
    } catch (error) {
      console.error('Error deleting skill:', error)
      toast.error('Failed to delete skill')
    }
  }

  const handleSendMessage = async (messageData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      })

      if (!response.ok) throw new Error('Failed to send message')
      toast.success('Message sent successfully')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const downloadReport = async (type: string, format: string = 'csv') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/reports?type=${type}&format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to generate report')

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }

      toast.success('Report downloaded successfully')
    } catch (error) {
      console.error('Error downloading report:', error)
      toast.error('Failed to download report')
    }
  }

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'swaps', label: 'Swaps', icon: '🔄' },
    { id: 'skills', label: 'Skills', icon: '🎯' },
    { id: 'messages', label: 'Messages', icon: '📢' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ]

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          
          {/* Stats Cards */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 text-xl">🔄</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSwapRequests}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-600 text-xl">⭐</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex justify-between items-center">
              <nav className="flex space-x-8">
                {tabConfig.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                ← Back to Main Site
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          {['users', 'swaps', 'skills'].includes(activeTab) && (
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchTabData()}
                placeholder={`Search ${activeTab}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => setActiveTab('swaps')}
                    className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    Monitor Swaps
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                  >
                    Send Announcement
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Recent Activity</h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">• {users.length} users in the system</p>
                  <p className="mb-1">• {swaps.length} swap requests</p>
                  <p className="mb-1">• {skills.length} skills available</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            onUserToggle={handleUserToggle}
          />
        )}

        {activeTab === 'swaps' && (
          <SwapsTab 
            swaps={swaps}
            onStatusChange={handleSwapStatusChange}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab 
            skills={skills}
            onSkillDelete={handleSkillDelete}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab 
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab 
            onDownloadReport={downloadReport}
          />
        )}
      </div>
    </Layout>
  )
}

// Component for Users Tab
function UsersTab({ users, onUserToggle }: { users: any[], onUserToggle: (id: number, isActive: boolean) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                      <div className="text-sm text-gray-500">{user.location || 'No location'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.role === 'admin' ? 'Admin' : 'User'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{user.totalSwapRequests} requests</div>
                  <div className="text-gray-500">{user.completedSwaps} completed</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onUserToggle(user.id, user.isActive)}
                    className={`${
                      user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.isActive ? 'Ban' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Component for Swaps Tab
function SwapsTab({ swaps, onStatusChange }: { swaps: any[], onStatusChange: (id: number, status: string) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Swap Requests Monitoring</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {swaps.map((swap) => (
              <tr key={swap.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{swap.requester.name}</div>
                    <div className="text-gray-500">↓ {swap.provider.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="text-green-600">Offers: {swap.offeredSkill.name}</div>
                    <div className="text-blue-600">Wants: {swap.wantedSkill.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                    swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(swap.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {swap.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onStatusChange(swap.id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => onStatusChange(swap.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Component for Skills Tab
function SkillsTab({ skills, onSkillDelete }: { skills: any[], onSkillDelete: (id: number) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Skills Management</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                  {skill.description && (
                    <div className="text-sm text-gray-500">{skill.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {skill.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{skill.usersCount} users</div>
                  <div className="text-gray-500">{skill.offeredCount} offered, {skill.wantedCount} wanted</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onSkillDelete(skill.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Component for Messages Tab
function MessagesTab({ messages, onSendMessage }: { messages: any[], onSendMessage: (data: any) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    sendToAll: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSendMessage(formData)
    setFormData({ title: '', content: '', type: 'info', sendToAll: true })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Platform Messages</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {showForm ? 'Cancel' : 'Send Message'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sendToAll}
                  onChange={(e) => setFormData({...formData, sendToAll: e.target.checked})}
                  className="mr-2"
                />
                Send to all users
              </label>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Send Message
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{message.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()} • {message.type}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {message.readCount}/{message.totalRecipients} read
                </div>
              </div>
              <p className="text-gray-700">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Component for Reports Tab
function ReportsTab({ onDownloadReport }: { onDownloadReport: (type: string, format: string) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Generate Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">User Activity Report</h3>
          <p className="text-sm text-gray-600 mb-4">Export detailed user statistics and activity data</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReport('users', 'csv')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              CSV
            </button>
            <button
              onClick={() => onDownloadReport('users', 'json')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Swap Requests Report</h3>
          <p className="text-sm text-gray-600 mb-4">Export all swap requests with details</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReport('swaps', 'csv')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              CSV
            </button>
            <button
              onClick={() => onDownloadReport('swaps', 'json')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Skills Analysis</h3>
          <p className="text-sm text-gray-600 mb-4">Export skills usage and popularity data</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReport('skills', 'csv')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              CSV
            </button>
            <button
              onClick={() => onDownloadReport('skills', 'json')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Ratings & Feedback</h3>
          <p className="text-sm text-gray-600 mb-4">Export user ratings and feedback logs</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReport('ratings', 'csv')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              CSV
            </button>
            <button
              onClick={() => onDownloadReport('ratings', 'json')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              JSON
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Complete Overview</h3>
          <p className="text-sm text-gray-600 mb-4">Export comprehensive platform statistics</p>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReport('overview', 'json')}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 