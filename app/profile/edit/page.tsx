'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  profilePhoto: z.string().url().optional().or(z.literal('')),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileEditPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [newOfferedSkill, setNewOfferedSkill] = useState('')
  const [newWantedSkill, setNewWantedSkill] = useState('')
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      const user = data.user

      setValue('name', user.name || '')
      setValue('location', user.location || '')
      setValue('profilePhoto', user.profilePhoto || '')

      setSkillsOffered(user.offeredSkills?.map((skill: any) => skill.name) || [])
      setSkillsWanted(user.wantedSkills?.map((skill: any) => skill.name) || [])
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const addOfferedSkill = () => {
    if (newOfferedSkill.trim() && !skillsOffered.includes(newOfferedSkill.trim())) {
      setSkillsOffered([...skillsOffered, newOfferedSkill.trim()])
      setNewOfferedSkill('')
    }
  }

  const addWantedSkill = () => {
    if (newWantedSkill.trim() && !skillsWanted.includes(newWantedSkill.trim())) {
      setSkillsWanted([...skillsWanted, newWantedSkill.trim()])
      setNewWantedSkill('')
    }
  }

  const removeOfferedSkill = (skillToRemove: string) => {
    setSkillsOffered(skillsOffered.filter(skill => skill !== skillToRemove))
  }

  const removeWantedSkill = (skillToRemove: string) => {
    setSkillsWanted(skillsWanted.filter(skill => skill !== skillToRemove))
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          skillsOffered,
          skillsWanted,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Update failed')
      }

      toast.success('Profile updated successfully!')
      router.push('/')
      
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Skilldoo</h1>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium">
                Home
              </Link>
              <Link href="/requests" className="text-purple-600 hover:text-purple-700 font-medium">
                Swap Requests
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="display-3 text-gray-900">Edit Profile</h2>
            <div className="flex space-x-3">
              <button
                type="submit"
                form="profile-form"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => router.back()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
          
          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    id="location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills Offered
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skillsOffered.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeOfferedSkill(skill)}
                            className="ml-2 text-green-200 hover:text-white"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newOfferedSkill}
                        onChange={(e) => setNewOfferedSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOfferedSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add skill you offer"
                      />
                      <button
                        type="button"
                        onClick={addOfferedSkill}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skills Wanted
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {skillsWanted.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeWantedSkill(skill)}
                            className="ml-2 text-blue-200 hover:text-white"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newWantedSkill}
                        onChange={(e) => setNewWantedSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWantedSkill())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add skill you want"
                      />
                      <button
                        type="button"
                        onClick={addWantedSkill}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., weekends"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Visibility
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-500 text-sm">Profile Photo</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="block w-full text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Add/Edit
                    </button>
                    <button
                      type="button"
                      className="block w-full text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-2">
                      Photo URL
                    </label>
                    <input
                      {...register('profilePhoto')}
                      type="url"
                      id="profilePhoto"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="Enter photo URL"
                    />
                    {errors.profilePhoto && (
                      <p className="mt-1 text-sm text-red-600">{errors.profilePhoto.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 