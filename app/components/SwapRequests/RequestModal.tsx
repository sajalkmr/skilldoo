'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { UserProfile, Skill } from '@/app/types'

const requestSchema = z.object({
  skillOffered: z.string().min(1, 'Please select a skill you offer'),
  skillWanted: z.string().min(1, 'Please select a skill you want'),
  message: z.string().optional(),
})

type RequestFormData = z.infer<typeof requestSchema>

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: UserProfile
  currentUserSkills: {
    offered: Skill[]
    wanted: Skill[]
  }
}

export default function RequestModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  currentUserSkills 
}: RequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  })

  const selectedOffered = watch('skillOffered')
  const selectedWanted = watch('skillWanted')

  useEffect(() => {
    if (isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: targetUser.id,
          skillOffered: parseInt(data.skillOffered),
          skillWanted: parseInt(data.skillWanted),
          message: data.message || ''
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send request')
      }

      toast.success('Swap request sent successfully!')
      onClose()
      reset()
    } catch (error) {
      console.error('Request error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Send Swap Request to {targetUser.name}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose one of your offered skills:
            </label>
            <select
              {...register('skillOffered')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a skill you offer...</option>
              {currentUserSkills.offered.map((skill) => (
                <option key={skill.id} value={skill.id.toString()}>
                  {skill.name}
                </option>
              ))}
            </select>
            {errors.skillOffered && (
              <p className="text-red-500 text-sm mt-1">{errors.skillOffered.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose one of their wanted skills:
            </label>
            <select
              {...register('skillWanted')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a skill they want...</option>
              {targetUser.wantedSkills.map((skill) => (
                <option key={skill.id} value={skill.id.toString()}>
                  {skill.name}
                </option>
              ))}
            </select>
            {errors.skillWanted && (
              <p className="text-red-500 text-sm mt-1">{errors.skillWanted.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional):
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add a personal message..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedOffered || !selectedWanted}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 