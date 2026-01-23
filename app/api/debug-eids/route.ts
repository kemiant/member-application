import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getApplications } from '@/lib/applications'
import { getInfoMeetingAttendees } from '@/lib/infoMeeting'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await getApplications()
    const attendees = await getInfoMeetingAttendees()

    const appEids = applications.slice(0, 10).map(app => ({
      raw: app.eid,
      normalized: app.eid.toLowerCase().trim(),
      rowNumber: app.rowNumber,
      name: `${app.firstName} ${app.lastName}`
    }))

    const attendeeEids = attendees.slice(0, 20).map(att => ({
      normalized: att.eid,
      name: `${att.firstName} ${att.lastName}`
    }))

    // Count occurrences
    const counts = new Map<string, number>()
    attendees.forEach(att => {
      const count = counts.get(att.eid) || 0
      counts.set(att.eid, count + 1)
    })

    return NextResponse.json({
      applicationEids: appEids,
      attendeeEids: attendeeEids,
      attendeeCounts: Object.fromEntries(counts)
    })
  } catch (error) {
    console.error('Error in debug:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
