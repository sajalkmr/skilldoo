import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    let whereClause: any = {}

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { requester: { name: { contains: search, mode: 'insensitive' } } },
        { provider: { name: { contains: search, mode: 'insensitive' } } },
        { message: { contains: search, mode: 'insensitive' } }
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
              email: true,
              profilePhoto: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true
            }
          },
          offeredSkill: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          wantedSkill: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          ratings: {
            select: {
              id: true,
              rating: true,
              feedback: true,
              fromUser: {
                select: { name: true }
              }
            }
          }
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
    console.error('Get admin swaps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch swap requests' },
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
    const { swapRequestId, status } = body

    const updatedSwapRequest = await db.swapRequest.update({
      where: { id: swapRequestId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        requester: { select: { name: true } },
        provider: { select: { name: true } }
      }
    })

    return NextResponse.json({
      message: 'Swap request updated successfully',
      swapRequest: updatedSwapRequest
    })
  } catch (error) {
    console.error('Update swap request error:', error)
    return NextResponse.json(
      { error: 'Failed to update swap request' },
      { status: 500 }
    )
  }
} 