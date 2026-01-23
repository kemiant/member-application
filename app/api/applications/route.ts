import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureRatingsSheet } from '@/lib/sheets'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'
import { getInfoMeetingAttendanceCounts } from '@/lib/infoMeeting'
import { getCoffeeChatAttendanceCounts } from '@/lib/coffeeChat'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ensure Ratings sheet exists
    await ensureRatingsSheet(process.env.GOOGLE_SHEETS_ID!)

    // Fetch applications, ratings, and info meeting attendance
    const applications = await getApplications()
    const ratingsMap = await getRatingsAvgMap()
    const attendanceCounts = await getInfoMeetingAttendanceCounts()
    const coffeeChatCounts = await getCoffeeChatAttendanceCounts()

    // Enrich applications with rating data and attendance count
    const enrichedApplications = applications.map(app => {
      const normalizedEid = app.eid.toLowerCase().trim()
      const ratingStats = ratingsMap.get(normalizedEid)
      return {
        ...app,
        avgRating: ratingStats?.avg || null,
        ratingsCount: ratingStats?.count || 0,
        comments: ratingStats?.comments || [],
        infoSessionsAttended: attendanceCounts.get(normalizedEid) || 0,
        coffeeChatCount: coffeeChatCounts.get(normalizedEid) || 0,
      }
    })

    // Sort by timestamp ascending (oldest first)
    enrichedApplications.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return NextResponse.json(enrichedApplications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
