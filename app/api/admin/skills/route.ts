import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const updateSkillSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const offset = (page - 1) * limit

    let whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category !== 'all') {
      whereClause.category = category
    }

    const [skills, totalCount] = await Promise.all([
      db.skill.findMany({
        where: whereClause,
        include: {
          userSkills: {
            select: {
              id: true,
              type: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              userSkills: true,
              offeredRequests: true,
              wantedRequests: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.skill.count({ where: whereClause })
    ])

    const formattedSkills = skills.map(skill => ({
      ...skill,
      usersCount: skill._count.userSkills,
      offeredCount: skill.userSkills.filter(us => us.type === 'offered').length,
      wantedCount: skill.userSkills.filter(us => us.type === 'wanted').length,
      requestsCount: skill._count.offeredRequests + skill._count.wantedRequests
    }))

    return NextResponse.json({
      skills: formattedSkills,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Get admin skills error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { skillId, ...updateData } = body
    const validatedData = updateSkillSchema.parse(updateData)

    const updatedSkill = await db.skill.update({
      where: { id: skillId },
      data: validatedData,
      include: {
        _count: {
          select: {
            userSkills: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Skill updated successfully',
      skill: updatedSkill
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update skill error:', error)
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    const user = await db.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const skillId = parseInt(searchParams.get('skillId') || '0')

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      )
    }

    await db.skill.delete({
      where: { id: skillId }
    })

    return NextResponse.json({
      message: 'Skill deleted successfully'
    })
  } catch (error) {
    console.error('Delete skill error:', error)
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    )
  }
} 