import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getApplicantStatuses, batchUpdateStatuses } from '@/lib/status'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const statusMap = await getApplicantStatuses()
    const statuses: Record<string, string> = {}
    
    statusMap.forEach((value, key) => {
      statuses[key] = value.status
    })

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('Error fetching statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statuses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { updates } = body

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request: updates array required' },
        { status: 400 }
      )
    }

    const updatedBy = session.user?.email || 'Unknown'
    await batchUpdateStatuses(updates, updatedBy)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating statuses:', error)
    return NextResponse.json(
      { error: 'Failed to update statuses' },
      { status: 500 }
    )
  }
}
