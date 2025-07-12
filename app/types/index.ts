export interface User {
  id: number
  email: string
  password: string
  name: string | null
  location: string | null
  profilePhoto: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Skill {
  id: number
  name: string
  category: string
  description: string | null
  createdAt: Date
}

export interface UserSkill {
  id: number
  userId: number
  skillId: number
  type: 'offered' | 'wanted'
  proficiencyLevel: number | null
  createdAt: Date
  user?: User
  skill?: Skill
}

export interface SwapRequest {
  id: number
  requesterId: number
  providerId: number
  skillOffered: number
  skillWanted: number
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  message: string | null
  createdAt: Date
  updatedAt: Date
  requester?: User
  provider?: User
  offeredSkill?: Skill
  wantedSkill?: Skill
}

export interface UserProfile extends User {
  userSkills: UserSkill[]
  offeredSkills: Skill[]
  wantedSkills: Skill[]
}

export interface SwapRequestWithDetails extends SwapRequest {
  requester: User
  provider: User
  offeredSkill: Skill
  wantedSkill: Skill
} 