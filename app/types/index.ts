export interface User {
  id: number
  email: string
  password: string
  name: string | null
  location: string | null
  profilePhoto: string | null
  availability: string | null
  isPublic: boolean
  isActive: boolean
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Skill {
  id: number
  name: string
  category: string
  description?: string
  createdAt: Date
}

export interface UserSkill {
  id: number
  userId: number
  skillId: number
  type: 'offered' | 'wanted'
  proficiencyLevel?: number
  createdAt: Date
  user: User
  skill: Skill
}

export interface SwapRequest {
  id: number
  requesterId: number
  providerId: number
  skillOffered: number
  skillWanted: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  message?: string
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  requester: User
  provider: User
  offeredSkill: Skill
  wantedSkill: Skill
  ratings?: Rating[]
}

export interface Rating {
  id: number
  swapRequestId: number
  fromUserId: number
  toUserId: number
  rating: number
  feedback?: string
  createdAt: Date
  swapRequest: SwapRequest
  fromUser: User
  toUser: User
}

export interface UserProfile {
  id: number
  name: string
  location?: string
  profilePhoto?: string
  availability?: string
  isPublic: boolean
  role: 'user' | 'admin'
  offeredSkills: Skill[]
  wantedSkills: Skill[]
  skillsCount: number
  averageRating?: number
  totalRatings?: number
  createdAt: Date
}

export interface SwapRequestWithDetails extends SwapRequest {
  requester: User
  provider: User
  offeredSkill: Skill
  wantedSkill: Skill
  ratings?: Rating[]
} 

export interface AdminStats {
  totalUsers: number
  totalSwapRequests: number
  totalCompletedSwaps: number
  pendingRequests: number
  activeUsers: number
}

export interface UserWithStats extends User {
  totalSwapRequests: number
  completedSwaps: number
  averageRating?: number
  totalRatings: number
} 