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
    const reportType = searchParams.get('type') || 'overview'
    const format = searchParams.get('format') || 'json'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      }
    }

    let reportData: any = {}

    if (reportType === 'overview' || reportType === 'all') {
      const [
        totalUsers,
        activeUsers,
        totalSkills,
        totalSwapRequests,
        completedSwaps,
        pendingSwaps,
        rejectedSwaps,
        totalRatings,
        averageRating
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.skill.count(),
        db.swapRequest.count(Object.keys(dateFilter).length > 0 ? { where: dateFilter } : undefined),
        db.swapRequest.count({ where: { status: 'completed', ...dateFilter } }),
        db.swapRequest.count({ where: { status: 'pending', ...dateFilter } }),
        db.swapRequest.count({ where: { status: 'rejected', ...dateFilter } }),
        db.rating.count(Object.keys(dateFilter).length > 0 ? { where: dateFilter } : undefined),
        db.rating.aggregate({
          _avg: { rating: true },
          ...(Object.keys(dateFilter).length > 0 && { where: dateFilter })
        })
      ])

      reportData.overview = {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalSkills,
        totalSwapRequests,
        completedSwaps,
        pendingSwaps,
        rejectedSwaps,
        totalRatings,
        averageRating: averageRating._avg?.rating || 0,
        completionRate: totalSwapRequests > 0 ? (completedSwaps / totalSwapRequests * 100) : 0
      }
    }

    if (reportType === 'users' || reportType === 'all') {
      const users = await db.user.findMany({
        where: dateFilter,
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          isActive: true,
          role: true,
          createdAt: true,
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
        orderBy: { createdAt: 'desc' }
      })

      reportData.users = users.map(user => ({
        ...user,
        totalSwapRequests: user.swapRequestsSent.length + user.swapRequestsReceived.length,
        completedSwaps: [
          ...user.swapRequestsSent.filter(r => r.status === 'completed'),
          ...user.swapRequestsReceived.filter(r => r.status === 'completed')
        ].length,
        averageRating: user.ratingsReceived.length > 0 
          ? user.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / user.ratingsReceived.length
          : 0
      }))
    }

    if (reportType === 'swaps' || reportType === 'all') {
      const swaps = await db.swapRequest.findMany({
        where: dateFilter,
        include: {
          requester: {
            select: { id: true, name: true, email: true }
          },
          provider: {
            select: { id: true, name: true, email: true }
          },
          offeredSkill: {
            select: { name: true, category: true }
          },
          wantedSkill: {
            select: { name: true, category: true }
          },
          ratings: {
            select: { rating: true, feedback: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      reportData.swaps = swaps
    }

    if (reportType === 'ratings' || reportType === 'all') {
      const ratings = await db.rating.findMany({
        where: dateFilter,
        include: {
          fromUser: {
            select: { id: true, name: true, email: true }
          },
          toUser: {
            select: { id: true, name: true, email: true }
          },
          swapRequest: {
            select: {
              id: true,
              offeredSkill: { select: { name: true } },
              wantedSkill: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      reportData.ratings = ratings
    }

    if (reportType === 'skills' || reportType === 'all') {
      const skills = await db.skill.findMany({
        include: {
          _count: {
            select: {
              userSkills: true,
              offeredRequests: true,
              wantedRequests: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      reportData.skills = skills.map(skill => ({
        ...skill,
        totalUsers: skill._count.userSkills,
        totalRequests: skill._count.offeredRequests + skill._count.wantedRequests
      }))
    }

    if (format === 'csv' && reportType === 'users') {
      const csv = generateUserCSV(reportData.users)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'csv' && reportType === 'swaps') {
      const csv = generateSwapCSV(reportData.swaps)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="swaps_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate,
        endDate
      },
      data: reportData
    })
  } catch (error) {
    console.error('Generate report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

function generateUserCSV(users: any[]) {
  const headers = ['ID', 'Name', 'Email', 'Location', 'Active', 'Role', 'Created At', 'Total Swaps', 'Completed Swaps', 'Average Rating']
  const rows = users.map(user => [
    user.id,
    user.name || '',
    user.email,
    user.location || '',
    user.isActive ? 'Yes' : 'No',
    user.role,
    user.createdAt,
    user.totalSwapRequests,
    user.completedSwaps,
    user.averageRating.toFixed(1)
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

function generateSwapCSV(swaps: any[]) {
  const headers = ['ID', 'Requester', 'Provider', 'Offered Skill', 'Wanted Skill', 'Status', 'Created At', 'Completed At']
  const rows = swaps.map(swap => [
    swap.id,
    swap.requester.name || swap.requester.email,
    swap.provider.name || swap.provider.email,
    swap.offeredSkill.name,
    swap.wantedSkill.name,
    swap.status,
    swap.createdAt,
    swap.completedAt || ''
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
} 