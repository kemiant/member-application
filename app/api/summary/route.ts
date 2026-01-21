import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'

interface SummaryData {
  totalApplications: number
  returningPath: number
  newPath: number
  byPrimaryMajor: Record<string, number>
  mcCombs: number
  nonMcCombs: number
  previousMembers: number
  topRated: Array<{
    eid: string
    firstName: string
    lastName: string
    primaryMajor: string
    avgRating: number
    ratingsCount: number
  }>
  previousMembersList: Array<{
    eid: string
    firstName: string
    lastName: string
    email: string
    primaryMajor: string
    year: string
    returningFavoriteMemory: string
    returningReEngage: string
    avgRating: number | null
    ratingsCount: number
  }>
}

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await getApplications()
    const ratingsMap = await getRatingsAvgMap()

    // Enrich applications with ratings
    const enrichedApps = applications.map(app => ({
      ...app,
      avgRating: ratingsMap.get(app.eid)?.avg || null,
      ratingsCount: ratingsMap.get(app.eid)?.count || 0,
    }))

    // Calculate aggregations
    const byPrimaryMajor: Record<string, number> = {}
    let mcCombs = 0
    let nonMcCombs = 0
    let previousMembers = 0
    let returningPath = 0
    let newPath = 0

    const previousMembersList = []

    for (const app of enrichedApps) {
      // Count by major
      if (app.primaryMajor) {
        byPrimaryMajor[app.primaryMajor] = (byPrimaryMajor[app.primaryMajor] || 0) + 1
      }

      // Count McCombs vs non-McCombs
      if (app.isMcCombs) {
        mcCombs++
      } else {
        nonMcCombs++
      }

      // Count previous members (previouslyMember starts with "y")
      if (app.previouslyMember.toLowerCase().startsWith('y')) {
        previousMembers++
      }

      // Count returning vs new path
      if (app.isReturningPath) {
        returningPath++
        
        // Add to previous members list if they have returning member info
        if (app.returningFavoriteMemory || app.returningReEngage) {
          previousMembersList.push({
            eid: app.eid,
            firstName: app.firstName,
            lastName: app.lastName,
            email: app.email,
            primaryMajor: app.primaryMajor,
            year: app.year,
            returningFavoriteMemory: app.returningFavoriteMemory,
            returningReEngage: app.returningReEngage,
            avgRating: app.avgRating,
            ratingsCount: app.ratingsCount,
          })
        }
      } else {
        newPath++
      }
    }

    // Get top rated applications (those with ratings, sorted by avg desc)
    const topRated = enrichedApps
      .filter(app => app.avgRating !== null)
      .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      .map(app => ({
        eid: app.eid,
        firstName: app.firstName,
        lastName: app.lastName,
        primaryMajor: app.primaryMajor,
        avgRating: app.avgRating!,
        ratingsCount: app.ratingsCount,
      }))

    const summary: SummaryData = {
      totalApplications: applications.length,
      returningPath,
      newPath,
      byPrimaryMajor,
      mcCombs,
      nonMcCombs,
      previousMembers,
      topRated,
      previousMembersList,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
