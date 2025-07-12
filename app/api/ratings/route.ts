import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const createRatingSchema = z.object({
  swapRequestId: z.number(),
  toUserId: z.number(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request)
    const body = await request.json()
    const { swapRequestId, toUserId, rating, feedback } = createRatingSchema.parse(body)

    // Check if swap request exists and is completed
    const swapRequest = await db.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        requester: true,
        provider: true
      }
    })

    if (!swapRequest) {
      return NextResponse.json(
        { error: 'Swap request not found' },
        { status: 404 }
      )
    }

    if (swapRequest.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only rate completed swaps' },
        { status: 400 }
      )
    }

    // Check if user is part of the swap
    if (swapRequest.requesterId !== authUser.userId && swapRequest.providerId !== authUser.userId) {
      return NextResponse.json(
        { error: 'You can only rate swaps you are part of' },
        { status: 403 }
      )
    }

    // Check if rating already exists
    const existingRating = await db.rating.findUnique({
      where: {
        swapRequestId_fromUserId: {
          swapRequestId,
          fromUserId: authUser.userId
        }
      }
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this swap' },
        { status: 400 }
      )
    }

    // Create rating
    const newRating = await db.rating.create({
      data: {
        swapRequestId,
        fromUserId: authUser.userId,
        toUserId,
        rating,
        feedback
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Rating submitted successfully',
      rating: newRating
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create rating error:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const swapRequestId = searchParams.get('swapRequestId')

    if (userId) {
      // Get ratings for a specific user
      const ratings = await db.rating.findMany({
        where: { toUserId: parseInt(userId) },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          swapRequest: {
            select: {
              id: true,
              offeredSkill: true,
              wantedSkill: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate average rating
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
        : 0

      return NextResponse.json({
        ratings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length
      })
    } else if (swapRequestId) {
      // Get ratings for a specific swap request
      const ratings = await db.rating.findMany({
        where: { swapRequestId: parseInt(swapRequestId) },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          toUser: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          }
        }
      })

      return NextResponse.json({ ratings })
    } else {
      return NextResponse.json(
        { error: 'Missing userId or swapRequestId parameter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
} 