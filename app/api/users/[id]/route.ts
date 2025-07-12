import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    const user = await db.user.findUnique({
      where: { 
        id: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        location: true,
        profilePhoto: true,
        createdAt: true,
        userSkills: {
          include: {
            skill: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.name) {
      return NextResponse.json(
        { error: 'User profile not public' },
        { status: 403 }
      )
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      location: user.location,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt,
      offeredSkills: user.userSkills
        .filter(us => us.type === 'offered')
        .map(us => us.skill),
      wantedSkills: user.userSkills
        .filter(us => us.type === 'wanted')
        .map(us => us.skill),
      skillsCount: user.userSkills.length
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
} 