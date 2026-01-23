import { getSheetsClient } from './sheets'

export interface Application {
  eid: string
  rowNumber: number
  timestamp: string
  firstName: string
  lastName: string
  email: string
  headshotUrl: string
  resumeUrl: string
  majors: string[]
  primaryMajor: string
  businessMinor: string
  year: string
  previouslyMember: string
  appliedBefore: string
  returningEssay1: string
  returningEssay2: string
  returningFavoriteMemory: string
  returningReEngage: string
  newEssay1: string
  newEssay2: string
  newEssay3: string
  events: string
  analyticsExperience: string
  lunch: string
  timeCommitments: string
  anythingElse: string
  isReturningPath: boolean
  isMcCombs: boolean
  infoSessionsAttended: number
  coffeeChatCount: number
}

// The exact resume header from Google Forms
const RESUME_HEADER = "Attach your resume.\n\n*If accepted, this will only be used for resume books to our sponsors. Your resume does not affect your application.*"

export async function getApplications(): Promise<Application[]> {
  const sheets = getSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Form Responses 1!A1:Z2000',
  })

  const rows = response.data.values
  if (!rows || rows.length === 0) {
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

  const eidIdx = getColIndex('EID')
  const timestampIdx = getColIndex('Timestamp')
  const firstNameIdx = getColIndex(/First.*Name/i)
  const lastNameIdx = getColIndex(/Last.*Name/i)
  const emailIdx = getColIndex(/Email/i)
  const headshotIdx = getColIndex(/headshot/i)
  const resumeIdx = headers.findIndex(h => h === RESUME_HEADER)
  const businessMinorIdx = getColIndex(/business.*minor/i)
  const yearIdx = getColIndex(/year/i)
  const previouslyMemberIdx = getColIndex(/previously.*member/i)
  const appliedBeforeIdx = getColIndex(/applied.*before|Have you applied/i)
  const eventsIdx = getColIndex(/events/i)
  const analyticsExpIdx = getColIndex(/analytics.*experience/i)
  const lunchIdx = getColIndex(/lunch/i)
  const timeCommitmentsIdx = getColIndex(/time.*commitment/i)
  const anythingElseIdx = getColIndex(/anything.*else/i)

  // Find major columns
  const majorIndices: number[] = []
  headers.forEach((h, i) => {
    if (/Major \d+:.*major/i.test(h)) {
      majorIndices.push(i)
    }
  })

  // Find school columns for McCombs detection
  const schoolIndices: number[] = []
  headers.forEach((h, i) => {
    if (/Major \d+:.*school/i.test(h)) {
      schoolIndices.push(i)
    }
  })

  // Find returning member essays
  const returningEssay1Idx = getColIndex(/Tell us about yourself.*returning/i)
  const returningEssay2Idx = getColIndex(/something in BAXA you hope to be more involved/i)
  const returningFavoriteMemoryIdx = getColIndex(/favorite.*memory/i)
  const returningReEngageIdx = getColIndex(/re-engage|re.*engage/i)

  // Find new member essays
  const newEssay1Idx = getColIndex(/Why do you want to be a part of BAXA/i)
  const newEssay2Idx = getColIndex(/Tell us about yourself!|Tell us about yourself(?!.*returning)/i)
  const newEssay3Idx = getColIndex(/new.*3/i)

  return dataRows.map((row, index) => {
    const majors = majorIndices.map(i => row[i] || '').filter(m => m.trim())
    const schools = schoolIndices.map(i => (row[i] || '').toLowerCase())
    
    const returningEssay1 = row[returningEssay1Idx] || ''
    const returningEssay2 = row[returningEssay2Idx] || ''
    const returningFavoriteMemory = row[returningFavoriteMemoryIdx] || ''
    const returningReEngage = row[returningReEngageIdx] || ''
    
    const isReturningPath = !!(returningEssay1 || returningEssay2 || returningFavoriteMemory || returningReEngage)
    const isMcCombs = schools.some(s => s.includes('mccombs'))

    return {
      eid: row[eidIdx] || '',
      rowNumber: index + 2, // 1-based, +1 for header row
      timestamp: row[timestampIdx] || '',
      firstName: row[firstNameIdx] || '',
      lastName: row[lastNameIdx] || '',
      email: row[emailIdx] || '',
      headshotUrl: row[headshotIdx] || '',
      resumeUrl: row[resumeIdx] || '',
      majors,
      schools: schoolIndices.map(i => row[i] || '').filter(s => s.trim()),
      primaryMajor: majors[0] || '',
      businessMinor: row[businessMinorIdx] || '',
      year: row[yearIdx] || '',
      previouslyMember: row[previouslyMemberIdx] || '',
      appliedBefore: row[appliedBeforeIdx] || '',
      returningEssay1,
      returningEssay2,
      returningFavoriteMemory,
      returningReEngage,
      newEssay1: row[newEssay1Idx] || '',
      newEssay2: row[newEssay2Idx] || '',
      newEssay3: row[newEssay3Idx] || '',
      events: row[eventsIdx] || '',
      analyticsExperience: row[analyticsExpIdx] || '',
      lunch: row[lunchIdx] || '',
      timeCommitments: row[timeCommitmentsIdx] || '',
      anythingElse: row[anythingElseIdx] || '',
      isReturningPath,
      isMcCombs,
      infoSessionsAttended: 0, // Will be enriched from actual sign-in sheet
      coffeeChatCount: 0, // Will be enriched from coffee chat sign-in sheet
    }
  })
}
