import { getSheetsClient } from './sheets'

export interface InfoMeetingAttendee {
  eid: string
  timestamp: string
  firstName: string
  lastName: string
  email: string
  major: string
  howHeard: string
}

export async function getInfoMeetingAttendees(): Promise<InfoMeetingAttendee[]> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_INFO_MEETING_SHEETS_ID!

  if (!spreadsheetId) {
    console.warn('GOOGLE_INFO_MEETING_SHEETS_ID not configured')
    return []
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Form Responses 1!A1:Z1000',
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Find column indices by matching headers
    // Columns: Timestamp, First Name:, Last Name:, EID:, Email:, Major/potential:, How did you hear about us?
    const getColIndex = (pattern: string | RegExp) => {
      return headers.findIndex((h) => 
        typeof pattern === 'string' ? h === pattern : pattern.test(h)
      )
    }

    const timestampIdx = getColIndex('Timestamp')
    const firstNameIdx = getColIndex(/First.*Name/i)
    const lastNameIdx = getColIndex(/Last.*Name/i)
    const eidIdx = getColIndex(/EID/i)
    const emailIdx = getColIndex(/Email/i)
    const majorIdx = getColIndex(/Major.*potential/i)
    const howHeardIdx = getColIndex(/How did you hear/i)

    return dataRows
      .map((row) => ({
        eid: (row[eidIdx] || '').toLowerCase().trim(),
        timestamp: row[timestampIdx] || '',
        firstName: row[firstNameIdx] || '',
        lastName: row[lastNameIdx] || '',
        email: row[emailIdx] || '',
        major: row[majorIdx] || '',
        howHeard: row[howHeardIdx] || '',
      }))
      .filter(attendee => attendee.eid) // Only include rows with EID
  } catch (error) {
    console.error('Error fetching info meeting attendees:', error)
    return []
  }
}

export async function getInfoMeetingAttendanceCounts(): Promise<Map<string, number>> {
  const attendees = await getInfoMeetingAttendees()
  const countMap = new Map<string, number>()
  
  // Count how many times each EID appears
  attendees.forEach(attendee => {
    const currentCount = countMap.get(attendee.eid) || 0
    countMap.set(attendee.eid, currentCount + 1)
  })
  
  return countMap
}
