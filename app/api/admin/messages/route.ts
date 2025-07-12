import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/app/lib/auth'
import { db } from '@/app/lib/db'

const messageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(2000),
  type: z.enum(['info', 'warning', 'announcement', 'maintenance']).default('info'),
  sendToAll: z.boolean().default(true),
  targetUserIds: z.array(z.number()).optional(),
})

export async function POST(request: NextRequest) {
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
    const validatedData = messageSchema.parse(body)

    const platformMessage = await db.platformMessage.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        authorId: authUser.userId,
      }
    })

    if (validatedData.sendToAll) {
      const allUsers = await db.user.findMany({
        where: { isActive: true },
        select: { id: true }
      })

      const userMessages = allUsers.map(user => ({
        userId: user.id,
        platformMessageId: platformMessage.id
      }))

      await db.userMessage.createMany({
        data: userMessages
      })
    } else if (validatedData.targetUserIds && validatedData.targetUserIds.length > 0) {
      const userMessages = validatedData.targetUserIds.map(userId => ({
        userId,
        platformMessageId: platformMessage.id
      }))

      await db.userMessage.createMany({
        data: userMessages
      })
    }

    return NextResponse.json({
      message: 'Platform message sent successfully',
      platformMessage
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

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
    const offset = (page - 1) * limit

    const [messages, totalCount] = await Promise.all([
      db.platformMessage.findMany({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          userMessages: {
            select: {
              id: true,
              isRead: true,
              readAt: true
            }
          },
          _count: {
            select: {
              userMessages: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.platformMessage.count()
    ])

    const formattedMessages = messages.map(message => ({
      ...message,
      totalRecipients: message._count.userMessages,
      readCount: message.userMessages.filter(um => um.isRead).length,
      unreadCount: message.userMessages.filter(um => !um.isRead).length
    }))

    return NextResponse.json({
      messages: formattedMessages,
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
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
} 