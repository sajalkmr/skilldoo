import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Exclude admin users from public browsing
    let whereClause: any = {
      isActive: true,
      name: { not: null },
      role: { not: 'admin' }
    }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { name: { contains: search } },
          { location: { contains: search } },
          {
            userSkills: {
              some: {
                skill: {
                  name: { contains: search }
                }
              }
            }
          }
        ]
      }
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause,
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
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where: whereClause })
    ])

    const formattedUsers = users.map(user => ({
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
    console.error('Browse users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 