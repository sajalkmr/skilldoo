import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from './db'

export interface AuthUser {
  userId: number
  email: string
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    return await verifyToken(token)
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const authUser = await getAuthUser(request)
  if (!authUser) {
    throw new Error('Unauthorized')
  }
  return authUser
}

export async function getCurrentUser(userId: number) {
  return await db.user.findUnique({
    where: { id: userId },
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
} 