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

  // Find major columns (captures "Major 1: What major..." and similar)
  const majorIndices: number[] = []
  headers.forEach((h, i) => {
    if (/Major \d+:.*major/i.test(h)) {
      majorIndices.push(i)
    }
  })

  // Find school columns (captures "Major 1: What school are you a part of?" and similar)
  // These are used both for school names AND for McCombs detection
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
  
  // Find ALL "Tell us about yourself" columns (there may be 2 with the same name)
  const tellUsAboutYourselfIndices: number[] = []
  headers.forEach((h, i) => {
    if (/Tell us about yourself[!]?(?!.*returning)/i.test(h)) {
      tellUsAboutYourselfIndices.push(i)
    }
  })
  
  const newEssay3Idx = getColIndex(/new.*3/i)

  const applications = dataRows.map((row, index) => {
    const majors = majorIndices.map(i => row[i] || '').filter(m => m.trim() && m.toLowerCase() !== 'na')
    const schools = schoolIndices.map(i => row[i] || '').filter(s => s.trim() && s.toLowerCase() !== 'na')
    const schoolsLower = schools.map(s => s.toLowerCase())
    
    // Use schools as the primary major source if majors is empty
    // This handles the case where "Major 1: What school are you a part of?" is the main column
    const allMajors = majors.length > 0 ? majors : schools
    
    const returningEssay1 = row[returningEssay1Idx] || ''
    const returningEssay2 = row[returningEssay2Idx] || ''
    const returningFavoriteMemory = row[returningFavoriteMemoryIdx] || ''
    const returningReEngage = row[returningReEngageIdx] || ''
    
    const isReturningPath = !!(returningEssay1 || returningEssay2 || returningFavoriteMemory || returningReEngage)
    const isMcCombs = schoolsLower.some(s => s.includes('mccombs'))

    // Handle multiple "Tell us about yourself" columns
    // If 2nd column is empty, fall back to 1st column
    let newEssay2 = ''
    if (tellUsAboutYourselfIndices.length >= 2) {
      newEssay2 = row[tellUsAboutYourselfIndices[1]] || row[tellUsAboutYourselfIndices[0]] || ''
    } else if (tellUsAboutYourselfIndices.length === 1) {
      newEssay2 = row[tellUsAboutYourselfIndices[0]] || ''
    }

    return {
      eid: row[eidIdx] || '',
      rowNumber: index + 2, // 1-based, +1 for header row
      timestamp: row[timestampIdx] || '',
      firstName: row[firstNameIdx] || '',
      lastName: row[lastNameIdx] || '',
      email: row[emailIdx] || '',
      headshotUrl: row[headshotIdx] || '',
      resumeUrl: row[resumeIdx] || '',
      majors: allMajors,
      schools,
      primaryMajor: allMajors[0] || '',
      businessMinor: row[businessMinorIdx] || '',
      year: row[yearIdx] || '',
      previouslyMember: row[previouslyMemberIdx] || '',
      appliedBefore: row[appliedBeforeIdx] || '',
      returningEssay1,
      returningEssay2,
      returningFavoriteMemory,
      returningReEngage,
      newEssay1: row[newEssay1Idx] || '',
      newEssay2,
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

  // Remove duplicates by keeping only the latest submission for each EID (case-insensitive)
  // Skip entries with empty EIDs to avoid grouping them together
  const uniqueApplications = new Map<string, typeof applications[0]>()
  const emptyEidApplications: typeof applications = []
  
  applications.forEach(app => {
    const normalizedEid = app.eid.toLowerCase().trim()
    
    // If EID is empty, keep all such applications separately
    if (!normalizedEid) {
      emptyEidApplications.push(app)
      return
    }
    
    const existing = uniqueApplications.get(normalizedEid)
    
    // Keep the application with the latest timestamp
    if (!existing || new Date(app.timestamp) > new Date(existing.timestamp)) {
      uniqueApplications.set(normalizedEid, app)
    }
  })

  return [...Array.from(uniqueApplications.values()), ...emptyEidApplications]
}
