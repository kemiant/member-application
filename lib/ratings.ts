import { getSheetsClient } from './sheets'

export interface Rating {
  eid: string
  raterName: string
  rating: number // 0-5
  comment: string
  timestamp: string
  assignedRows: string
}

export interface RatingStats {
  avg: number
  count: number
}

// Append a rating to the Ratings sheet
export async function appendRating(rating: {
  eid: string
  raterName: string
  rating: number
  comment?: string
  assignedRows?: string
}): Promise<void> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  const timestamp = new Date().toISOString()
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Ratings!A1:F1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        rating.eid,
        rating.raterName,
        rating.rating,
        rating.comment || '',
        timestamp,
        rating.assignedRows || '',
      ]],
    },
  })
}

// Get all ratings and compute average ratings per EID
export async function getRatingsAvgMap(): Promise<Map<string, RatingStats>> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Ratings!A2:F10000', // Skip header row
  })

  const rows = response.data.values || []
  
  // Group ratings by EID
  const ratingsByEid = new Map<string, number[]>()
  
  rows.forEach(row => {
    const eid = row[0]
    const rating = parseFloat(row[2])
    
    if (eid && !isNaN(rating)) {
      if (!ratingsByEid.has(eid)) {
        ratingsByEid.set(eid, [])
      }
      ratingsByEid.get(eid)!.push(rating)
    }
  })

  // Calculate averages
  const avgMap = new Map<string, RatingStats>()
  
  ratingsByEid.forEach((ratings, eid) => {
    const sum = ratings.reduce((acc, r) => acc + r, 0)
    const avg = sum / ratings.length
    avgMap.set(eid, { avg, count: ratings.length })
  })

  return avgMap
}
