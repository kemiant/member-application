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
  coffeeChatCount: number
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
  const [filterType, setFilterType] = useState<'top' | 'minimum' | null>(null)
  const [topN, setTopN] = useState(60)
  const [minimumScore, setMinimumScore] = useState(3.0)

  // Filter based on selected filter type - show nothing if no filter selected
  const filteredApps = !filterType ? [] : 
    filterType === 'top' 
      ? topRated.slice(0, topN)
      : topRated.filter(app => app.avgRating >= minimumScore)

  const copyFilteredEmails = () => {
    const emails = filteredApps.map(app => app.email).join(', ')
    
    navigator.clipboard.writeText(emails).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Calculate stats for filtered apps
  const filteredMcCombs = filteredApps.filter(app => app.isMcCombs).length
  const filteredNonMcCombs = filteredApps.length - filteredMcCombs
  const filteredByYear: Record<string, number> = {}
  filteredApps.forEach(app => {
    if (app.year) {
      filteredByYear[app.year] = (filteredByYear[app.year] || 0) + 1
    }
  })

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, color: 'var(--baxa-purple-dark)' }}>
          Top Rated Applicants ({filteredApps.length})
        </h2>
        {topRated.length > 0 && (
          <button
            onClick={copyFilteredEmails}
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
            {copied ? '✓ Copied!' : `📋 Copy ${filteredApps.length} Emails`}
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        backgroundColor: '#f9fafb', 
        borderRadius: '0.375rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by:</label>
            <select 
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as 'top' | 'minimum' || null)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--baxa-purple-light)',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Select filter...</option>
              <option value="top">Top N</option>
              <option value="minimum">Minimum Score</option>
            </select>
          </div>

          {filterType === 'top' ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem' }}>Show top:</label>
              <input
                type="number"
                min="1"
                max={topRated.length}
                value={topN}
                onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '80px',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--baxa-purple-light)',
                  fontSize: '0.875rem'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                applicants
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem' }}>Min score:</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minimumScore}
                onChange={(e) => setMinimumScore(parseFloat(e.target.value) || 0)}
                style={{
                  width: '80px',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--baxa-purple-light)',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Compact Breakdown Stats */}
      {filteredApps.length > 0 && (
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
                  {filteredMcCombs}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  ({((filteredMcCombs / filteredApps.length) * 100).toFixed(0)}%)
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
                  {filteredNonMcCombs}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  ({((filteredNonMcCombs / filteredApps.length) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Year Stats */}
            {Object.keys(filteredByYear).length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Year:</span>
                {Object.entries(filteredByYear)
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
      ) : !filterType ? (
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          Select a filter above to view applicants
        </p>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {filteredApps.map(app => (
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>
                    {app.firstName} {app.lastName}
                  </h3>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.875rem', 
                    color: app.primaryMajor ? (app.isMcCombs ? '#10b981' : 'var(--text-secondary)') : '#999',
                    fontStyle: app.primaryMajor ? 'normal' : 'italic',
                    fontWeight: app.isMcCombs ? 600 : 'normal',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {app.primaryMajor || 'No major listed'}
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
                <span 
                  className="badge"
                  style={{
                    backgroundColor: app.coffeeChatCount > 0 ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                >
                  Coffee: {app.coffeeChatCount}
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
