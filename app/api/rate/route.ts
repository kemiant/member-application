import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { upsertRating } from '@/lib/ratings'

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
    
    // Use upsert to either update existing rating or append new one
    const result = await upsertRating({
      eid: normalizedEid,
      raterName,
      rating,
      comment: comment || '',
      assignedRows: assignedRows || '',
    })

    return NextResponse.json({ success: true, updated: result.updated })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
