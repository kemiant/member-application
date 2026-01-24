import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { appendRating, updateRating, hasRated } from '@/lib/ratings'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { eid, rating, raterName, comment, assignedRows } = body

    // Validate required fields
    if (!eid || rating === undefined || !raterName) {
      return NextResponse.json(
        { error: 'Missing required fields: eid, rating, raterName' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 0 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 0 and 5' },
        { status: 400 }
      )
    }

    const normalizedEid = eid.toLowerCase().trim()
    
    // Check if this rater has already rated this applicant
    const alreadyRated = await hasRated(normalizedEid, raterName)
    
    const ratingData = {
      eid: normalizedEid,
      raterName,
      rating,
      comment: comment || '',
      assignedRows: assignedRows || '',
    }

    if (alreadyRated) {
      // Update existing rating
      await updateRating(ratingData)
      return NextResponse.json({ success: true, updated: true })
    } else {
      // Append new rating
      await appendRating(ratingData)
      return NextResponse.json({ success: true, updated: false })
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
