import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getApplications } from '@/lib/applications'
import { getRatingsAvgMap } from '@/lib/ratings'
import { getInfoMeetingAttendanceCounts } from '@/lib/infoMeeting'
import Navigation from '@/components/Navigation'
import TopRatedSection from '@/components/TopRatedSection'
import '@/styles/theme.css'

interface SummaryData {
  totalApplications: number
  returningPath: number
  newPath: number
  byPrimaryMajor: Record<string, number>
  mcCombs: number
  nonMcCombs: number
  previousMembers: number
  top60McCombs: number
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
    ratingsCount: number
    infoSessionsAttended: number
    rowNumber: number
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

  // Enrich applications with ratings and info session attendance
  const enrichedApps = applications.map(app => ({
    ...app,
    avgRating: ratingsMap.get(app.eid)?.avg || null,
    ratingsCount: ratingsMap.get(app.eid)?.count || 0,
    raterNames: ratingsMap.get(app.eid)?.raterNames || [],
    infoSessionsAttended: attendanceCounts.get(app.eid) || 0,
  }))

  // Calculate aggregations
  const byPrimaryMajor: Record<string, number> = {}
  let mcCombs = 0
  let nonMcCombs = 0
  let previousMembers = 0
  let returningPath = 0
  let newPath = 0

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

    // Count previous members (previouslyMember starts with "y")
    if (app.previouslyMember.toLowerCase().startsWith('y')) {
      previousMembers++
    }

    // Count returning vs new path
    if (app.isReturningPath) {
      returningPath++
      
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
    } else {
      newPath++
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
      rowNumber: app.rowNumber,
      previouslyMember: app.previouslyMember,
      appliedBefore: app.appliedBefore,
    }))

  // Calculate how many of top 60 are McCombs
  const top60 = topRated.slice(0, 60)
  const top60McCombs = top60.filter(app => app.isMcCombs).length

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
      ratingsCount: app.ratingsCount,
      infoSessionsAttended: app.infoSessionsAttended,
      rowNumber: app.rowNumber,
    }))

  const summary: SummaryData = {
    totalApplications: applications.length,
    returningPath,
    newPath,
    byPrimaryMajor,
    mcCombs,
    nonMcCombs,
    previousMembers,
    top60McCombs,
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
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Total Applications
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.totalApplications}
          </p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Returning Applicants
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.returningPath}
          </p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            McCombs
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.mcCombs}
          </p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Non-McCombs
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.nonMcCombs}
          </p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Previous Members
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.previousMembers}
          </p>
        </div>
      </div>

      {/* Top 60 Rated Section */}
      <TopRatedSection topRated={summary.topRated} />

      {/* Top Rated */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--baxa-purple-dark)' }}>
          All Applicants - Ratings Summary
        </h2>
        {summary.allRatings.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No applications found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderBottom: '2px solid var(--baxa-purple-light)'
                }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Row</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Major</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Year</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Path</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Info Sessions</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Avg Rating</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}># Ratings</th>
                </tr>
              </thead>
              <tbody>
                {summary.allRatings.map((app, index) => (
                  <tr 
                    key={app.eid}
                    style={{ 
                      borderBottom: '1px solid var(--card-border)',
                      backgroundColor: app.infoSessionsAttended === 0 ? 'rgba(239, 68, 68, 0.05)' : 
                                       index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-purple">{app.rowNumber}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                      {app.firstName} {app.lastName}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {app.primaryMajor}
                        {app.isMcCombs && (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>McCombs</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{app.year}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {app.isReturningPath ? (
                        <span className="badge badge-warning">Returning</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#3b82f6', color: 'white' }}>New</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: app.infoSessionsAttended > 0 ? '#10b981' : '#ef4444',
                          color: 'white',
                        }}
                      >
                        {app.infoSessionsAttended}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: app.avgRating !== null ? 'var(--baxa-purple)' : 'var(--text-secondary)'
                    }}>
                      {app.avgRating !== null ? app.avgRating.toFixed(2) : '-'}
                    </td>
                    <td style={{ 
                      padding: '0.75rem', 
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      {app.ratingsCount > 0 ? app.ratingsCount : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
