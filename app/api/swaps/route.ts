import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const createSwapRequestSchema = z.object({
  providerId: z.number(),
  skillOffered: z.number(),
  skillWanted: z.number(),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const body = await request.json()
    const { providerId, skillOffered, skillWanted, message } = createSwapRequestSchema.parse(body)

    if (authUser.userId === providerId) {
      return NextResponse.json(
        { error: 'Cannot send request to yourself' },
        { status: 400 }
      )
    }

    const existingRequest = await db.swapRequest.findFirst({
      where: {
        requesterId: authUser.userId,
        providerId,
        status: 'pending'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request with this user' },
        { status: 400 }
      )
    }

    const swapRequest = await db.swapRequest.create({
      data: {
        requesterId: authUser.userId,
        providerId,
        skillOffered,
        skillWanted,
        message,
        status: 'pending'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        },
        offeredSkill: true,
        wantedSkill: true
      }
    })

    return NextResponse.json({
      message: 'Swap request created successfully',
      swapRequest
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create swap request error:', error)
    return NextResponse.json(
      { error: 'Failed to create swap request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let whereClause: any = {}

    if (type === 'incoming') {
      whereClause.providerId = authUser.userId
    } else if (type === 'outgoing') {
      whereClause.requesterId = authUser.userId
    } else {
      whereClause.OR = [
        { providerId: authUser.userId },
        { requesterId: authUser.userId }
      ]
    }

    const [swapRequests, totalCount] = await Promise.all([
      db.swapRequest.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          offeredSkill: true,
          wantedSkill: true
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.swapRequest.count({ where: whereClause })
    ])

    return NextResponse.json({
      swapRequests,
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
    console.error('Get swap requests error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
} 