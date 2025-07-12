'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Skill } from '@/app/types'

interface UserCardProps {
  user: {
    id: number
    name: string
    location?: string
    profilePhoto?: string
    offeredSkills: Skill[]
    wantedSkills: Skill[]
    skillsCount: number
  }
  currentUserId?: number
  onRequestClick?: (user: any) => void
}

export default function UserCard({ user, currentUserId, onRequestClick }: UserCardProps) {
  const [imageError, setImageError] = useState(false)
  const isCurrentUser = currentUserId === user.id

  const handleRequestClick = () => {
    if (onRequestClick) {
      onRequestClick(user)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {user.profilePhoto && !imageError ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                <Link 
                  href={`/users/${user.id}`}
                  className="hover:text-purple-600 transition-colors"
                >
                  {user.name}
                </Link>
              </h3>
              {user.location && (
                <p className="text-sm text-gray-500 truncate">{user.location}</p>
              )}
            </div>
            
            {currentUserId && !isCurrentUser && (
              <button
                onClick={handleRequestClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Request
              </button>
            )}
          </div>
          
          <div className="mt-4 space-y-3">
            {user.offeredSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Offers:</p>
                <div className="flex flex-wrap gap-1">
                  {user.offeredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {user.offeredSkills.length > 3 && (
                    <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs">
                      +{user.offeredSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {user.wantedSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Wants:</p>
                <div className="flex flex-wrap gap-1">
                  {user.wantedSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {user.wantedSkills.length > 3 && (
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                      +{user.wantedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {user.offeredSkills.length === 0 && user.wantedSkills.length === 0 && (
              <p className="text-sm text-gray-500 italic">No skills listed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 