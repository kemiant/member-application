import { getSheetsClient } from './sheets'
import { cache } from './cache'

export interface ApplicantStatus {
  eid: string
  status: 'accepted' | 'declined' | 'leaning-yes' | 'leaning-no'
  timestamp: string
  updatedBy: string
}

// Get all applicant statuses
export async function getApplicantStatuses(): Promise<Map<string, ApplicantStatus>> {
  // Check cache first (2 minute TTL)
  const cached = cache.get<Map<string, ApplicantStatus>>('statuses', 120000)
  if (cached) {
    return cached
  }

  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Status!A2:D10000', // Skip header row
    })

    const rows = response.data.values || []
    const statusMap = new Map<string, ApplicantStatus>()

    rows.forEach(row => {
      const eid = (row[0] || '').toLowerCase().trim()
      const status = row[1] as 'accepted' | 'declined'
      const timestamp = row[2] || ''
      const updatedBy = row[3] || ''

      if (eid && (status === 'accepted' || status === 'declined')) {
        statusMap.set(eid, { eid, status, timestamp, updatedBy })
      }
    })

    // Cache the result
    cache.set('statuses', statusMap)

    return statusMap
  } catch (error: any) {
    // If sheet doesn't exist, return empty map
    if (error?.response?.status === 400) {
      console.log('Status sheet does not exist yet, will be created on first save')
      return new Map()
    }
    throw error
  }
}

// Update or create applicant status
export async function upsertApplicantStatus(
  eid: string,
  status: 'accepted' | 'declined',
  updatedBy: string
): Promise<void> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  // Get all existing statuses
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Status!A2:D10000',
  }).catch(() => ({ data: { values: [] } })) // Handle sheet not existing

  const rows = response.data.values || []
  const normalizedEid = eid.toLowerCase().trim()

  // Find existing row
  let rowIndex = -1
  for (let i = 0; i < rows.length; i++) {
    const rowEid = (rows[i][0] || '').toLowerCase().trim()
    if (rowEid === normalizedEid) {
      rowIndex = i + 2 // +2 for header row and 1-based indexing
      break
    }
  }

  const timestamp = new Date().toISOString()
  const values = [[eid, status, timestamp, updatedBy]]

  try {
    if (rowIndex !== -1) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Status!A${rowIndex}:D${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values },
      })
    } else {
      // Append new row (will create sheet if doesn't exist)
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Status!A1:D1',
        valueInputOption: 'RAW',
        requestBody: { values },
      })
    }

    // Clear cache to force refresh
    cache.clear('statuses')
  } catch (error: any) {
    // If sheet doesn't exist, create it with headers and data
    if (error?.response?.status === 400) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Status',
              },
            },
          }],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Status!A1:D1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['EID', 'Status', 'Timestamp', 'Updated By']],
        },
      })

      // Add the data
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Status!A1:D1',
        valueInputOption: 'RAW',
        requestBody: { values },
      })

      cache.clear('statuses')
    } else {
      throw error
    }
  }
}

// Batch update multiple statuses
export async function batchUpdateStatuses(
  updates: Array<{ eid: string; status: 'accepted' | 'declined' }>,
  updatedBy: string
): Promise<void> {
  for (const update of updates) {
    await upsertApplicantStatus(update.eid, update.status, updatedBy)
  }
}
