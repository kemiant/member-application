import { getSheetsClient } from './sheets'
import { cache } from './cache'

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

// Update an existing rating or append if not found (combined operation to reduce API calls)
export async function upsertRating(rating: {
  eid: string
  raterName: string
  rating: number
  comment?: string
  assignedRows?: string
}): Promise<{ updated: boolean }> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  // Get all ratings in a single read operation
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Ratings!A2:F10000', // Skip header row
  })

  const rows = response.data.values || []
  const normalizedEid = rating.eid.toLowerCase().trim()
  const normalizedRaterName = rating.raterName.toLowerCase().trim()
  
  // Find the row index
  let rowIndex = -1
  for (let i = 0; i < rows.length; i++) {
    const rowEid = (rows[i][0] || '').toLowerCase().trim()
    const rowRaterName = (rows[i][1] || '').toLowerCase().trim()
    if (rowEid === normalizedEid && rowRaterName === normalizedRaterName) {
      rowIndex = i + 2 // +2 for header row and 1-based indexing
      break
    }
  }

  const timestamp = new Date().toISOString()
  const values = [[
    rating.eid,
    rating.raterName,
    rating.rating,
    rating.comment || '',
    timestamp,
    rating.assignedRows || '',
  ]]

  if (rowIndex !== -1) {
    // Update existing rating
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Ratings!A${rowIndex}:F${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    })
    
    // Clear ratings cache to force refresh
    cache.clear('ratings')
    
    return { updated: true }
  } else {
    // Append new rating
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Ratings!A1:F1',
      valueInputOption: 'RAW',
      requestBody: { values },
    })
    
    // Clear ratings cache to force refresh
    cache.clear('ratings')
    
    return { updated: false }
  }
}

// Get all ratings and compute average ratings per EID
export async function getRatingsAvgMap(): Promise<Map<string, RatingStats>> {
  // Check cache first (2 minute TTL)
  const cached = cache.get<Map<string, RatingStats>>('ratings', 120000)
  if (cached) {
    return cached
  }

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

  // Cache the result
  cache.set('ratings', avgMap)

  return avgMap
}
