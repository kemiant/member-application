import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'
import { getInfoMeetingAttendanceCounts } from '@/lib/infoMeeting'
import { getCoffeeChatAttendanceCounts } from '@/lib/coffeeChat'
import Navigation from '@/components/Navigation'
import TopRatedSection from '@/components/TopRatedSection'
import AllApplicantsTable from '@/components/AllApplicantsTable'
import '@/styles/theme.css'

interface SummaryData {
  totalApplications: number
  returningApplicants: number
  newApplicants: number
  byPrimaryMajor: Record<string, number>
  mcCombs: number
  nonMcCombs: number
  previousMembers: number
  top60McCombs: number
  top60NonMcCombs: number
  top60ByYear: Record<string, number>
  topRated: Array<{
    eid: string
    firstName: string
    lastName: string
    email: string
    primaryMajor: string
    year: string
    isMcCombs: boolean
    isReturningPath: boolean
    avgRating: number
    ratingsCount: number
    raterNames: string[]
    infoSessionsAttended: number
    coffeeChatCount: number
    rowNumber: number
    previouslyMember: string
    appliedBefore: string
  }>
  allRatings: Array<{
    eid: string
    firstName: string
    lastName: string
    primaryMajor: string
    year: string
    isMcCombs: boolean
    isReturningPath: boolean
    avgRating: number | null
    coffeeChatCount: number
    rowNumber: number
    headshotUrl: string
    email: string
    notes: string
  }>
  previousMembersList: Array<{
    eid: string
    firstName: string
    lastName: string
    email: string
    primaryMajor: string
    year: string
    returningFavoriteMemory: string
    returningReEngage: string
    avgRating: number | null
    ratingsCount: number
  }>
}

export const dynamic = 'force-dynamic'

export default async function SummaryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  // Fetch data directly instead of calling API route
  const applications = await getApplications()
  const ratingsMap = await getRatingsAvgMap()
  const attendanceCounts = await getInfoMeetingAttendanceCounts()
  const coffeeChatCounts = await getCoffeeChatAttendanceCounts()

  // Enrich applications with ratings and info session attendance
  const enrichedApps = applications.map(app => {
    const normalizedEid = app.eid.toLowerCase().trim()
    const ratingStats = ratingsMap.get(normalizedEid)
    return {
      ...app,
      avgRating: ratingStats?.avg || null,
      ratingsCount: ratingStats?.count || 0,
      raterNames: ratingStats?.raterNames || [],
      comments: ratingStats?.comments || [],
      infoSessionsAttended: attendanceCounts.get(normalizedEid) || 0,
      coffeeChatCount: coffeeChatCounts.get(normalizedEid) || 0,
    }
  })

  // Calculate aggregations
  const byPrimaryMajor: Record<string, number> = {}
  let mcCombs = 0
  let nonMcCombs = 0
  let previousMembers = 0
  let returningApplicants = 0
  let newApplicants = 0

  const previousMembersList = []

  for (const app of enrichedApps) {
    // Count by major
    if (app.primaryMajor) {
      byPrimaryMajor[app.primaryMajor] = (byPrimaryMajor[app.primaryMajor] || 0) + 1
    }

    // Count McCombs vs non-McCombs
    if (app.isMcCombs) {
      mcCombs++
    } else {
      nonMcCombs++
    }

    // Count previous members (was actually a member before)
    if (app.previouslyMember.toLowerCase().startsWith('y')) {
      previousMembers++
      
      // Add to previous members list if they have returning member info
      if (app.returningFavoriteMemory || app.returningReEngage) {
        previousMembersList.push({
          eid: app.eid,
          firstName: app.firstName,
          lastName: app.lastName,
          email: app.email,
          primaryMajor: app.primaryMajor,
          year: app.year,
          returningFavoriteMemory: app.returningFavoriteMemory,
          returningReEngage: app.returningReEngage,
          avgRating: app.avgRating,
          ratingsCount: app.ratingsCount,
        })
      }
    }

    // Count returning applicants vs new applicants
    // Returning = applied before but wasn't a member
    // New = never applied before and never been a member
    const appliedBefore = app.appliedBefore?.toLowerCase() === 'yes'
    const wasMember = app.previouslyMember?.toLowerCase() === 'yes'
    
    if (appliedBefore && !wasMember) {
      returningApplicants++
    } else if (!appliedBefore && !wasMember) {
      newApplicants++
    }
  }

  // Get top rated applications (those with ratings, sorted by avg desc)
  const topRated = enrichedApps
    .filter(app => app.avgRating !== null)
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .map(app => ({
      eid: app.eid,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      primaryMajor: app.primaryMajor,
      year: app.year,
      isMcCombs: app.isMcCombs,
      isReturningPath: app.isReturningPath,
      avgRating: app.avgRating!,
      ratingsCount: app.ratingsCount,
      raterNames: app.raterNames,
      infoSessionsAttended: app.infoSessionsAttended,
      coffeeChatCount: app.coffeeChatCount,
      rowNumber: app.rowNumber,
      previouslyMember: app.previouslyMember,
      appliedBefore: app.appliedBefore,
    }))

  // Calculate how many of top 60 are McCombs
  const top60 = topRated.slice(0, 60)
  const top60McCombs = top60.filter(app => app.isMcCombs).length
  const top60NonMcCombs = top60.length - top60McCombs

  // Calculate top 60 by year
  const top60ByYear: Record<string, number> = {}
  top60.forEach(app => {
    if (app.year) {
      top60ByYear[app.year] = (top60ByYear[app.year] || 0) + 1
    }
  })

  // Get all applications sorted by rating (with unrated at the end)
  const allRatings = enrichedApps
    .sort((a, b) => {
      // Sort by rating (nulls last), then by row number
      if (a.avgRating === null && b.avgRating === null) return a.rowNumber - b.rowNumber
      if (a.avgRating === null) return 1
      if (b.avgRating === null) return -1
      return b.avgRating - a.avgRating
    })
    .map(app => ({
      eid: app.eid,
      firstName: app.firstName,
      lastName: app.lastName,
      primaryMajor: app.primaryMajor,
      year: app.year,
      isMcCombs: app.isMcCombs,
      isReturningPath: app.isReturningPath,
      avgRating: app.avgRating,
      coffeeChatCount: app.coffeeChatCount,
      rowNumber: app.rowNumber,
      headshotUrl: app.headshotUrl,
      email: app.email,
      notes: '',
    }))

  const summary: SummaryData = {
    totalApplications: applications.length,
    returningApplicants,
    newApplicants,
    byPrimaryMajor,
    mcCombs,
    nonMcCombs,
    previousMembers,
    top60McCombs,
    top60NonMcCombs,
    top60ByYear,
    topRated,
    allRatings,
    previousMembersList,
  }

  return (
    <>
      <Navigation />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          marginBottom: '1.5rem', 
          color: 'var(--baxa-purple-dark)',
          fontSize: '2rem'
        }}>
          Applications Summary
        </h1>

      {/* Overview Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.05) 0%, rgba(136, 85, 187, 0.08) 100%)', borderLeft: '3px solid var(--baxa-purple)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#663399" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
            Total Applications
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)', position: 'relative', zIndex: 1 }}>
            {summary.totalApplications}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.05) 0%, rgba(136, 85, 187, 0.08) 100%)', borderLeft: '3px solid var(--baxa-purple)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#663399" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
            Returning Applicants
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)', position: 'relative', zIndex: 1 }}>
            {summary.returningApplicants}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.05) 0%, rgba(136, 85, 187, 0.08) 100%)', borderLeft: '3px solid var(--baxa-purple)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#663399" strokeWidth="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
            McCombs
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)', position: 'relative', zIndex: 1 }}>
            {summary.mcCombs}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.05) 0%, rgba(136, 85, 187, 0.08) 100%)', borderLeft: '3px solid var(--baxa-purple)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#663399" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
            Non-McCombs
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)', position: 'relative', zIndex: 1 }}>
            {summary.nonMcCombs}
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(102, 51, 153, 0.05) 0%, rgba(136, 85, 187, 0.08) 100%)', borderLeft: '3px solid var(--baxa-purple)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.1 }} width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#663399" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            <polyline points="17 11 19 13 23 9"></polyline>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem', position: 'relative', zIndex: 1 }}>
            Previous Members
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)', position: 'relative', zIndex: 1 }}>
            {summary.previousMembers}
          </p>
        </div>
      </div>

      {/* Top 60 Rated Section */}
      <TopRatedSection 
        topRated={summary.topRated} 
        top60McCombs={summary.top60McCombs}
        top60NonMcCombs={summary.top60NonMcCombs}
        top60ByYear={summary.top60ByYear}
      />

      {/* Top Rated */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--baxa-purple-dark)' }}>
          All Applicants - Ratings Summary
        </h2>
        {summary.allRatings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No applications found</p>
        ) : (
          <AllApplicantsTable allRatings={summary.allRatings} />
        )}
      </div>
      </div>
    </>
  )
}
