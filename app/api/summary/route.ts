import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'
import { getInfoMeetingAttendanceCounts } from '@/lib/infoMeeting'

interface SummaryData {
  totalApplications: number
  returningPath: number
  newPath: number
  byPrimaryMajor: Record<string, number>
  mcCombs: number
  nonMcCombs: number
  previousMembers: number
  top60McCombs: number
  topRated: Array<{
    eid: string
    firstName: string
    lastName: string
    email: string
    primaryMajor: string
    year: string
    isMcCombs: boolean
    isReturningPath: boolean
    avgRating: number
    ratingsCount: number
    raterNames: string[]
    infoSessionsAttended: number
    rowNumber: number
    previouslyMember: string
    appliedBefore: string
  }>
  allRatings: Array<{
    eid: string
    firstName: string
    lastName: string
    primaryMajor: string
    year: string
    isMcCombs: boolean
    isReturningPath: boolean
    avgRating: number | null
    ratingsCount: number
    infoSessionsAttended: number
    rowNumber: number
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
    const attendanceCounts = await getInfoMeetingAttendanceCounts()

    // Enrich applications with ratings and info session attendance
    const enrichedApps = applications.map(app => ({
      ...app,
      avgRating: ratingsMap.get(app.eid)?.avg || null,
      ratingsCount: ratingsMap.get(app.eid)?.count || 0,
      raterNames: ratingsMap.get(app.eid)?.raterNames || [],
      infoSessionsAttended: attendanceCounts.get(app.eid.toLowerCase().trim()) || 0,
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
        email: app.email,
        primaryMajor: app.primaryMajor,
        year: app.year,
        isMcCombs: app.isMcCombs,
        isReturningPath: app.isReturningPath,
        avgRating: app.avgRating!,
        ratingsCount: app.ratingsCount,
        raterNames: app.raterNames,
        infoSessionsAttended: app.infoSessionsAttended,
        rowNumber: app.rowNumber,
        previouslyMember: app.previouslyMember,
        appliedBefore: app.appliedBefore,
      }))

    // Calculate how many of top 60 are McCombs
    const top60 = topRated.slice(0, 60)
    const top60McCombs = top60.filter(app => app.isMcCombs).length

    // Get all applications sorted by rating (with unrated at the end)
    const allRatings = enrichedApps
      .sort((a, b) => {
        // Sort by rating (nulls last), then by row number
        if (a.avgRating === null && b.avgRating === null) return a.rowNumber - b.rowNumber
        if (a.avgRating === null) return 1
        if (b.avgRating === null) return -1
        return b.avgRating - a.avgRating
      })
      .map(app => ({
        eid: app.eid,
        firstName: app.firstName,
        lastName: app.lastName,
        primaryMajor: app.primaryMajor,
        year: app.year,
        isMcCombs: app.isMcCombs,
        isReturningPath: app.isReturningPath,
        avgRating: app.avgRating,
        ratingsCount: app.ratingsCount,
        infoSessionsAttended: app.infoSessionsAttended,
        rowNumber: app.rowNumber,
      }))

    const summary: SummaryData = {
      totalApplications: applications.length,
      returningPath,
      newPath,
      byPrimaryMajor,
      mcCombs,
      nonMcCombs,
      previousMembers,
      top60McCombs,
      topRated,
      allRatings,
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
