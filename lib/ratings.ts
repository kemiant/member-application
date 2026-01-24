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

// Update an existing rating in the Ratings sheet
export async function updateRating(rating: {
  eid: string
  raterName: string
  rating: number
  comment?: string
  assignedRows?: string
}): Promise<boolean> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  // First, find the row with this EID and rater name
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Ratings!A2:F10000', // Skip header row
  })

  const rows = response.data.values || []
  const normalizedEid = rating.eid.toLowerCase().trim()
  const normalizedRaterName = rating.raterName.toLowerCase().trim()
  
  // Find the row index (add 2 because: 1 for header, 1 for 0-based to 1-based)
  let rowIndex = -1
  for (let i = 0; i < rows.length; i++) {
    const rowEid = (rows[i][0] || '').toLowerCase().trim()
    const rowRaterName = (rows[i][1] || '').toLowerCase().trim()
    if (rowEid === normalizedEid && rowRaterName === normalizedRaterName) {
      rowIndex = i + 2 // +2 for header row and 1-based indexing
      break
    }
  }

  if (rowIndex === -1) {
    return false // Rating not found
  }

  // Update the row
  const timestamp = new Date().toISOString()
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Ratings!A${rowIndex}:F${rowIndex}`,
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

  return true
}

// Check if a rater has already rated an applicant
export async function hasRated(eid: string, raterName: string): Promise<boolean> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Ratings!A2:B10000', // Only need EID and rater name columns
  })

  const rows = response.data.values || []
  const normalizedEid = eid.toLowerCase().trim()
  const normalizedRaterName = raterName.toLowerCase().trim()
  
  return rows.some(row => {
    const rowEid = (row[0] || '').toLowerCase().trim()
    const rowRaterName = (row[1] || '').toLowerCase().trim()
    return rowEid === normalizedEid && rowRaterName === normalizedRaterName
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
