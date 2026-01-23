'use client'

import { useState } from 'react'
import ApplicationModal from './ApplicationModal'

interface TopRatedApp {
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
}

interface TopRatedSectionProps {
  topRated: TopRatedApp[]
  top60McCombs: number
  top60NonMcCombs: number
  top60ByYear: Record<string, number>
}

export default function TopRatedSection({ topRated, top60McCombs, top60NonMcCombs, top60ByYear }: TopRatedSectionProps) {
  const [copied, setCopied] = useState(false)
  const [selectedEid, setSelectedEid] = useState<string | null>(null)

  const copyTop60Emails = () => {
    const top60 = topRated.slice(0, 60)
    const emails = top60.map(app => app.email).join(', ')
    
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const top60Count = Math.min(60, topRated.length)

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--baxa-purple-dark)' }}>
          Top 60 Rated Applicants
        </h2>
        {topRated.length > 0 && (
          <button
            onClick={copyTop60Emails}
            style={{
              backgroundColor: copied ? '#10b981' : 'var(--baxa-purple)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Top 60 Emails'}
          </button>
        )}
      </div>

      {/* Compact Breakdown Stats */}
      {top60Count > 0 && (
        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '0.75rem', 
          backgroundColor: '#faf9fc', 
          borderRadius: '0.375rem',
          border: '1px solid var(--baxa-purple-light)'
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* School Stats */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>School:</span>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'white',
                borderRadius: '0.25rem',
                borderLeft: '2px solid var(--success)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>McCombs:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  {top60McCombs}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  ({((top60McCombs / top60Count) * 100).toFixed(0)}%)
                </span>
              </div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'white',
                borderRadius: '0.25rem',
                borderLeft: '2px solid var(--baxa-purple)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Other:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
                  {top60NonMcCombs}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  ({((top60NonMcCombs / top60Count) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Year Stats */}
            {Object.keys(top60ByYear).length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
                {Object.entries(top60ByYear)
                  .sort((a, b) => {
                    const yearOrder: Record<string, number> = { 'Freshman': 1, 'Sophomore': 2, 'Junior': 3, 'Senior': 4, 'Graduate': 5 }
                    return (yearOrder[a[0]] || 999) - (yearOrder[b[0]] || 999)
                  })
                  .map(([year, count]) => (
                    <div 
                      key={year}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '0.25rem',
                        borderLeft: '2px solid var(--baxa-purple-light)'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{year.slice(0, 4)}:</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--baxa-purple-dark)' }}>
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {topRated.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No rated applications yet</p>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {topRated.slice(0, 60).map(app => (
              <div
                key={app.eid}
                onClick={() => setSelectedEid(app.eid)}
                style={{ 
                  padding: '1rem',
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--baxa-purple-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
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
                  {app.raterNames.length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {app.raterNames.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-purple">Row {app.rowNumber}</span>
                <span className="badge badge-purple">{app.year}</span>
                {app.isMcCombs && <span className="badge badge-success">McCombs</span>}
                {app.isReturningPath && <span className="badge badge-warning">Returning</span>}
                {app.previouslyMember === 'Yes' && <span className="badge badge-info">Previous Member</span>}
                {app.appliedBefore === 'Yes' && <span className="badge badge-secondary">Applied Before</span>}
                <span 
                  className="badge"
                  style={{
                    backgroundColor: app.infoSessionsAttended > 0 ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                >
                  Info: {app.infoSessionsAttended}
                </span>
              </div>
              </div>
            ))}
          </div>
          
          {selectedEid && (
            <ApplicationModal 
              eid={selectedEid} 
              onClose={() => setSelectedEid(null)} 
            />
          )}
        </>
      )}
    </div>
  )
}
