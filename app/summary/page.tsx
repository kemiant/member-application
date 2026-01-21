import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import '@/styles/theme.css'

interface SummaryData {
  totalApplications: number
  returningPath: number
  newPath: number
  byPrimaryMajor: Record<string, number>
  mcCombs: number
  nonMcCombs: number
  previousMembers: number
  topRated: Array<{
    eid: string
    firstName: string
    lastName: string
    primaryMajor: string
    avgRating: number
    ratingsCount: number
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

async function getSummary(): Promise<SummaryData> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/summary`, {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch summary')
  }
  
  return response.json()
}

export default async function SummaryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  const summary = await getSummary()

  return (
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
            Returning Path
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.returningPath}
          </p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            New Path
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
            {summary.newPath}
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

      {/* By Major */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--baxa-purple-dark)' }}>
          Applications by Major
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '0.75rem'
        }}>
          {Object.entries(summary.byPrimaryMajor)
            .sort((a, b) => b[1] - a[1])
            .map(([major, count]) => (
              <div 
                key={major}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderRadius: '0.375rem'
                }}
              >
                <span style={{ fontWeight: 500 }}>{major}</span>
                <span className="badge badge-purple">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Top Rated */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--baxa-purple-dark)' }}>
          Top Rated Applicants
        </h2>
        {summary.topRated.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No rated applications yet</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {summary.topRated.slice(0, 20).map(app => (
              <div 
                key={app.eid}
                style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--baxa-purple-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>
                      {app.firstName} {app.lastName}
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {app.primaryMajor}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: 'var(--baxa-purple)' 
                    }}>
                      {app.avgRating.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {app.ratingsCount} rating{app.ratingsCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Members */}
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--baxa-purple-dark)' }}>
          Previous Members (Returning Applicants)
        </h2>
        {summary.previousMembersList.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No returning members with responses</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summary.previousMembersList.map(member => (
              <div 
                key={member.eid}
                style={{ 
                  padding: '1.25rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                    {member.firstName} {member.lastName}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span className="badge badge-purple">{member.year}</span>
                    <span className="badge badge-purple">{member.primaryMajor}</span>
                    {member.avgRating !== null && (
                      <span className="badge badge-success">
                        ⭐ {member.avgRating.toFixed(2)} ({member.ratingsCount})
                      </span>
                    )}
                  </div>
                </div>

                {member.returningFavoriteMemory && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Favorite Memory:
                    </strong>
                    <p style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap' }}>
                      {member.returningFavoriteMemory}
                    </p>
                  </div>
                )}

                {member.returningReEngage && (
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      How to Re-engage:
                    </strong>
                    <p style={{ margin: '0.25rem 0 0 0', whiteSpace: 'pre-wrap' }}>
                      {member.returningReEngage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
