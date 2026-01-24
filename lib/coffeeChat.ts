import { getSheetsClient } from './sheets'
import { cache } from './cache'

export interface CoffeeChatAttendee {
  eid: string
  timestamp: string
  firstName: string
  lastName: string
  email: string
}

export async function getCoffeeChatAttendees(): Promise<CoffeeChatAttendee[]> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_COFFEE_CHAT_SHEETS_ID!

  if (!spreadsheetId) {
    console.warn('GOOGLE_COFFEE_CHAT_SHEETS_ID not configured')
    return []
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Form Responses 1!A1:Z1000',
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      console.log('Coffee chat sheet is empty or has no data')
      return []
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)

    // Find column indices by matching headers
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

    return dataRows
      .map((row) => ({
        eid: (row[eidIdx] || '').toLowerCase().trim(),
        timestamp: row[timestampIdx] || '',
        firstName: row[firstNameIdx] || '',
        lastName: row[lastNameIdx] || '',
        email: row[emailIdx] || '',
      }))
      .filter(attendee => attendee.eid) // Only include rows with EID
  } catch (error) {
    console.error('Error fetching coffee chat attendees:', error)
    return []
  }
}

export async function getCoffeeChatAttendanceCounts(): Promise<Map<string, number>> {
  // Check cache first (2 minute TTL)
  const cached = cache.get<Map<string, number>>('coffeeChats', 120000)
  if (cached) {
    return cached
  }

  const attendees = await getCoffeeChatAttendees()
  const countMap = new Map<string, number>()
  
  // Count how many times each EID appears (case-insensitive)
  attendees.forEach(attendee => {
    const currentCount = countMap.get(attendee.eid) || 0
    countMap.set(attendee.eid, currentCount + 1)
  })
  
  // Cache the result
  cache.set('coffeeChats', countMap)
  
  return countMap
}
