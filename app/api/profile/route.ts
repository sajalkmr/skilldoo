import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  location: z.string().optional(),
  profilePhoto: z.string().url().optional().nullable(),
  skillsOffered: z.array(z.string()).optional(),
  skillsWanted: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const body = await request.json()
    const { name, location, profilePhoto, skillsOffered, skillsWanted } = updateProfileSchema.parse(body)

    // Update user basic info
    const updatedUser = await db.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(profilePhoto !== undefined && { profilePhoto }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        location: true,
        profilePhoto: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Handle skills updates
    if (skillsOffered || skillsWanted) {
      // Remove existing skills
      await db.userSkill.deleteMany({
        where: { userId: authUser.userId }
      })

      // Add new skills
      const skillsToAdd = []
      
      if (skillsOffered) {
        for (const skillName of skillsOffered) {
          // Create or find skill
          const skill = await db.skill.upsert({
            where: { name: skillName },
            update: {},
            create: {
              name: skillName,
              category: 'General',
              description: `Skill: ${skillName}`
            }
          })
          
          skillsToAdd.push({
            userId: authUser.userId,
            skillId: skill.id,
            type: 'offered'
          })
        }
      }

      if (skillsWanted) {
        for (const skillName of skillsWanted) {
          // Create or find skill
          const skill = await db.skill.upsert({
            where: { name: skillName },
            update: {},
            create: {
              name: skillName,
              category: 'General',
              description: `Skill: ${skillName}`
            }
          })
          
          skillsToAdd.push({
            userId: authUser.userId,
            skillId: skill.id,
            type: 'wanted'
          })
        }
      }

      // Create user skills
      if (skillsToAdd.length > 0) {
        await db.userSkill.createMany({
          data: skillsToAdd
        })
      }
    }

    // Get updated profile
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
      ...updatedUser,
      userSkills,
      offeredSkills,
      wantedSkills
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userProfile
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 