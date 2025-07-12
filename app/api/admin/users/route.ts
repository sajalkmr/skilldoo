import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['user', 'admin']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    // Check if user is admin
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
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    let whereClause: any = {}

    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
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
          swapRequestsSent: {
            select: { id: true, status: true }
          },
          swapRequestsReceived: {
            select: { id: true, status: true }
          },
          ratingsReceived: {
            select: { rating: true }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where: whereClause })
    ])

    const formattedUsers = users.map(user => ({
      ...user,
      totalSwapRequests: user.swapRequestsSent.length + user.swapRequestsReceived.length,
      completedSwaps: [
        ...user.swapRequestsSent.filter(r => r.status === 'completed'),
        ...user.swapRequestsReceived.filter(r => r.status === 'completed')
      ].length,
      averageRating: user.ratingsReceived.length > 0 
        ? user.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / user.ratingsReceived.length
        : 0,
      totalRatings: user.ratingsReceived.length
    }))

    return NextResponse.json({
      users: formattedUsers,
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
    console.error('Get admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    
    // Check if user is admin
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
    const { userId, ...updateData } = body
    const validatedData = updateUserSchema.parse(updateData)

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 