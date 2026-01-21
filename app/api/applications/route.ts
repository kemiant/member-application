import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureRatingsSheet } from '@/lib/sheets'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ensure Ratings sheet exists
    await ensureRatingsSheet(process.env.GOOGLE_SHEETS_ID!)

    // Fetch applications and ratings
    const applications = await getApplications()
    const ratingsMap = await getRatingsAvgMap()

    // Enrich applications with rating data
    const enrichedApplications = applications.map(app => ({
      ...app,
      avgRating: ratingsMap.get(app.eid)?.avg || null,
      ratingsCount: ratingsMap.get(app.eid)?.count || 0,
    }))

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
