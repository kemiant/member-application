import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInfoMeetingAttendees } from '@/lib/infoMeeting'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const attendees = await getInfoMeetingAttendees()

    return NextResponse.json(attendees)
  } catch (error) {
    console.error('Error fetching info meeting attendees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch info meeting attendees' },
      { status: 500 }
    )
  }
}
