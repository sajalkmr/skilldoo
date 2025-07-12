import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        location: true,
        profilePhoto: true,
        availability: true,
        isPublic: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user skills
    const userSkills = await db.userSkill.findMany({
      where: { userId: authUser.userId },
      include: {
        skill: true
      }
    })

    const offeredSkills = userSkills
      .filter(us => us.type === 'offered')
      .map(us => us.skill)

    const wantedSkills = userSkills
      .filter(us => us.type === 'wanted')
      .map(us => us.skill)

    const userProfile = {
      ...user,
      userSkills,
      offeredSkills,
      wantedSkills
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
} 