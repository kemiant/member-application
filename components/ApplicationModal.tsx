'use client'

import { useEffect, useState } from 'react'

interface Application {
  eid: string
  rowNumber: number
  firstName: string
  lastName: string
  email: string
  year: string
  primaryMajor: string
  majors: string[]
  isMcCombs: boolean
  previouslyMember: string
  appliedBefore: string
  headshotUrl: string
  resumeUrl: string
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
  avgRating: number | null
  ratingsCount: number
  infoSessionsAttended: number
  comments?: Array<{ raterName: string; rating: number; comment: string; timestamp: string }>
}

interface ApplicationModalProps {
  eid: string
  onClose: () => void
}

export default function ApplicationModal({ eid, onClose }: ApplicationModalProps) {
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEssays, setShowEssays] = useState(true)
  const [showAdditional, setShowAdditional] = useState(true)

  useEffect(() => {
    // Fetch application data
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        const app = data.find((a: Application) => a.eid === eid)
        setApplication(app)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [eid])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (loading || !application) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <div style={{ color: 'white', fontSize: '1.5rem' }}>
          {loading ? 'Loading...' : 'Application not found'}
        </div>
      </div>
    )
  }

  const notConsidered = application.infoSessionsAttended === 0

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="card" 
          style={{ 
            margin: 0,
            opacity: notConsidered ? 0.5 : 1,
            position: 'relative',
            border: notConsidered ? '2px solid #ef4444' : undefined,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              zIndex: 10,
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--baxa-purple-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ×
          </button>

          {notConsidered && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />
          )}
          
          <div className="card-header" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <h3 className="card-title" style={{ margin: '0 0 0.25rem 0' }}>
                  {application.firstName} {application.lastName}
                </h3>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {application.majors.filter(m => m && m.trim() && m.toLowerCase() !== 'na').join(', ') || 'No major listed'}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontFamily: 'monospace' }}>
                  {application.eid}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {application.avgRating !== null && (
                  <>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--baxa-purple)' }}>
                      {application.avgRating.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {application.ratingsCount} rating{application.ratingsCount !== 1 ? 's' : ''}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="badge badge-purple">Row {application.rowNumber}</span>
              <span className="badge badge-purple">{application.year}</span>
              {application.isMcCombs && <span className="badge badge-success">McCombs</span>}
              {application.isReturningPath && <span className="badge badge-warning">Returning</span>}
              {application.previouslyMember === 'Yes' && <span className="badge badge-info">Previous Member</span>}
              {application.appliedBefore === 'Yes' && <span className="badge badge-secondary">Applied Before</span>}
              {notConsidered && (
                <span className="badge badge-error">NOT CONSIDERED</span>
              )}
              <span 
                className="badge"
                style={{
                  backgroundColor: application.infoSessionsAttended > 0 ? '#10b981' : '#ef4444',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              >
                Info: {application.infoSessionsAttended}
              </span>
            </div>

            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              Email: {application.email}
            </p>
          </div>

          <div className="card-body">
            {/* Resume */}
            <div style={{ marginBottom: '1rem' }}>
              {application.resumeUrl && (
                <a 
                  href={application.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ marginBottom: '0.5rem' }}
                >
                  View Resume
                </a>
              )}
            </div>

            {/* Comments Section */}
            {application.comments && application.comments.length > 0 && (
              <div className="modal-comments-section" style={{ marginBottom: '1rem' }}>
                <h4 className="comments-section-title">
                  Rating Comments ({application.comments.length})
                </h4>
                <div className="comments-list">
                  {application.comments.map((c, idx) => (
                    <div key={idx} className="comment-card">
                      <div className="comment-card-header">
                        <strong className="comment-card-rater-name">{c.raterName}</strong>
                        <span className="badge badge-purple">Rating: {c.rating}</span>
                      </div>
                      {c.comment && (
                        <p className="comment-card-text-wrap">
                          {c.comment}
                        </p>
                      )}
                      {!c.comment && (
                        <p className="comment-card-text-empty">
                          No comment provided
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Essays Section */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setShowEssays(!showEssays)}
                className="btn"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              >
                {showEssays ? '▼' : '▶'} Essays
              </button>
              {showEssays && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderRadius: '0.25rem',
                  marginBottom: '1rem'
                }}>
                  {application.isReturningPath ? (
                    <>
                      {application.returningEssay1 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Tell us about yourself (returning):</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.returningEssay1}</p>
                        </div>
                      )}
                      {application.returningEssay2 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>What are your goals for BAXA?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.returningEssay2}</p>
                        </div>
                      )}
                      {application.returningFavoriteMemory && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Favorite BAXA memory:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.returningFavoriteMemory}</p>
                        </div>
                      )}
                      {application.returningReEngage && (
                        <div>
                          <strong>How will you re-engage?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.returningReEngage}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {application.newEssay1 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Why do you want to be a part of BAXA?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.newEssay1}</p>
                        </div>
                      )}
                      {application.analyticsExperience && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>What experience do you have with data analytics or data science?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.analyticsExperience}</p>
                        </div>
                      )}
                      {application.lunch && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Which person (dead or alive) would you want to have lunch with and why?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.lunch}</p>
                        </div>
                      )}
                      {application.timeCommitments && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>What are your other time commitments this semester?:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.timeCommitments}</p>
                        </div>
                      )}
                      {application.newEssay2 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Tell us about yourself!:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.newEssay2}</p>
                        </div>
                      )}
                      {application.newEssay3 && (
                        <div>
                          <strong>Tell us about your leadership experience:</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.newEssay3}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <button
                onClick={() => setShowAdditional(!showAdditional)}
                className="btn"
                style={{ width: '100%', marginBottom: '0.5rem' }}
              >
                {showAdditional ? '▼' : '▶'} Additional Information
              </button>
              {showAdditional && (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--baxa-purple-bg)',
                  borderRadius: '0.25rem'
                }}>
                  {application.anythingElse && (
                    <div>
                      <strong>Anything else:</strong>
                      <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{application.anythingElse}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
