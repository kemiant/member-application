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
  raterNames: string[]
  comments: Array<{ raterName: string; rating: number; comment: string; timestamp: string }>
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
  
  // Group ratings by EID with rater names and comments
  const ratingsByEid = new Map<string, { 
    ratings: number[]
    raterNames: string[]
    comments: Array<{ raterName: string; rating: number; comment: string; timestamp: string }>
  }>()
  
  rows.forEach(row => {
    const eid = (row[0] || '').toLowerCase().trim()
    const raterName = row[1]
    const rating = parseFloat(row[2])
    const comment = row[3] || ''
    const timestamp = row[4] || ''
    
    if (eid && !isNaN(rating)) {
      if (!ratingsByEid.has(eid)) {
        ratingsByEid.set(eid, { ratings: [], raterNames: [], comments: [] })
      }
      const data = ratingsByEid.get(eid)!
      data.ratings.push(rating)
      if (raterName) {
        data.raterNames.push(raterName)
      }
      data.comments.push({ raterName, rating, comment, timestamp })
    }
  })

  // Calculate averages
  const avgMap = new Map<string, RatingStats>()
  
  ratingsByEid.forEach((data, eid) => {
    const sum = data.ratings.reduce((acc, r) => acc + r, 0)
    const avg = sum / data.ratings.length
    avgMap.set(eid, { 
      avg, 
      count: data.ratings.length, 
      raterNames: data.raterNames,
      comments: data.comments
    })
  })

  return avgMap
}
