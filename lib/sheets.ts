import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

// Create JWT client for service account authentication
export function getSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  
  if (!privateKey || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error('Missing Google service account credentials')
  }

  const jwtClient = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth: jwtClient })
}

// Ensure the Ratings tab exists with proper headers
export async function ensureRatingsSheet(spreadsheetId: string) {
  const sheets = getSheetsClient()

  try {
    // Get all sheets in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const ratingsSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === 'Ratings'
    )

    if (!ratingsSheet) {
      // Create the Ratings sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Ratings',
                },
              },
            },
          ],
        },
      })

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Ratings!A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['EID', 'RaterName', 'Rating', 'Comment', 'Timestamp', 'AssignedRows']],
        },
      })

      console.log('Created Ratings sheet with headers')
    }
  } catch (error) {
    console.error('Error ensuring Ratings sheet:', error)
    throw error
  }
}
