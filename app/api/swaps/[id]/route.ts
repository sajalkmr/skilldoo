import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const updateSwapRequestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'completed']),
  message: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request)
    const { id } = await params
    const swapRequestId = parseInt(id)
    const body = await request.json()
    const { status, message } = updateSwapRequestSchema.parse(body)

    const existingRequest = await db.swapRequest.findUnique({
      where: { id: swapRequestId },
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
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Swap request not found' },
        { status: 404 }
      )
    }

    if (existingRequest.providerId !== authUser.userId && existingRequest.requesterId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this request' },
        { status: 403 }
      )
    }

    if (status === 'accepted' || status === 'rejected') {
      if (existingRequest.providerId !== authUser.userId) {
        return NextResponse.json(
          { error: 'Only the provider can accept or reject requests' },
          { status: 403 }
        )
      }
    }

    const updatedRequest = await db.swapRequest.update({
      where: { id: swapRequestId },
      data: {
        status,
        ...(message && { message }),
        updatedAt: new Date()
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
      message: `Swap request ${status} successfully`,
      swapRequest: updatedRequest
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update swap request error:', error)
    return NextResponse.json(
      { error: 'Failed to update swap request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request)
    const { id } = await params
    const swapRequestId = parseInt(id)

    const existingRequest = await db.swapRequest.findUnique({
      where: { id: swapRequestId }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Swap request not found' },
        { status: 404 }
      )
    }

    if (existingRequest.requesterId !== authUser.userId) {
      return NextResponse.json(
        { error: 'Only the requester can delete requests' },
        { status: 403 }
      )
    }

    await db.swapRequest.delete({
      where: { id: swapRequestId }
    })

    return NextResponse.json({
      message: 'Swap request deleted successfully'
    })
  } catch (error) {
    console.error('Delete swap request error:', error)
    return NextResponse.json(
      { error: 'Failed to delete swap request' },
      { status: 500 }
    )
  }
} 