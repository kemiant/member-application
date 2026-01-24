'use client'

import { useState } from 'react'
import ApplicationModal from './ApplicationModal'

interface AllApplicantsTableProps {
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
}

export default function AllApplicantsTable({ allRatings }: AllApplicantsTableProps) {
  const [selectedEid, setSelectedEid] = useState<string | null>(null)

  return (
    <>
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
            {allRatings.map((app, index) => (
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
                <td 
                  style={{ 
                    padding: '0.75rem', 
                    fontWeight: 500,
                    color: 'var(--baxa-purple)',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  onClick={() => setSelectedEid(app.eid)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  {app.firstName} {app.lastName}
                </td>
                <td style={{ padding: '0.75rem', minWidth: '150px' }}>
                  <span style={{ 
                    color: app.primaryMajor ? (app.isMcCombs ? '#10b981' : 'inherit') : '#999', 
                    fontStyle: app.primaryMajor ? 'normal' : 'italic',
                    fontSize: '0.875rem',
                    fontWeight: app.isMcCombs ? 600 : 'normal'
                  }}>
                    {app.primaryMajor || 'No major listed'}
                  </span>
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
      
      {selectedEid && (
        <ApplicationModal 
          eid={selectedEid} 
          onClose={() => setSelectedEid(null)} 
        />
      )}
    </>
  )
}
