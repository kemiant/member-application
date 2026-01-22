'use client'

import { useState } from 'react'

interface Application {
  eid: string
  rowNumber: number
  firstName: string
  lastName: string
  email: string
  year: string
  primaryMajor: string
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
}

interface ApplicationCardProps {
  application: Application
  onRate: (eid: string, rating: number, comment: string) => Promise<void>
}

export default function ApplicationCard({ application, onRate }: ApplicationCardProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEssays, setShowEssays] = useState(false)
  const [showAdditional, setShowAdditional] = useState(false)
  const [showName, setShowName] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === null) return

    setIsSubmitting(true)
    try {
      await onRate(application.eid, rating, comment)
      setRating(null)
      setComment('')
      alert('Rating submitted successfully!')
    } catch (error) {
      alert('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const notConsidered = application.infoSessionsAttended === 0

  return (
    <div 
      className="card" 
      style={{ 
        marginBottom: '1rem',
        opacity: notConsidered ? 0.5 : 1,
        position: 'relative',
        border: notConsidered ? '2px solid #ef4444' : undefined,
      }}
    >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              {showName ? `${application.firstName} ${application.lastName}` : `Applicant ${application.rowNumber}`}
            </h3>
            <button
              onClick={() => setShowName(!showName)}
              style={{
                backgroundColor: 'var(--baxa-purple)',
                color: 'white',
                border: 'none',
                padding: '0.25rem 0.625rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {showName ? '🔒 Hide' : '👁️ Reveal'}
            </button>
          </div>
          {notConsidered && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}>
              NOT CONSIDERED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span className="badge badge-purple">Row {application.rowNumber}</span>
          <span className="badge badge-purple">{application.year}</span>
          <span className="badge badge-purple">{application.primaryMajor}</span>
          {application.isMcCombs && (
            <span className="badge badge-success">McCombs</span>
          )}
          {application.isReturningPath && (
            <span className="badge badge-warning">Returning</span>
          )}
          {application.previouslyMember?.toLowerCase().startsWith('y') && (
            <span className="badge" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>Previous Member</span>
          )}
          {application.appliedBefore?.toLowerCase().startsWith('y') && (
            <span className="badge" style={{ backgroundColor: '#f59e0b', color: 'white' }}>Applied Before</span>
          )}
          <span 
            className="badge"
            style={{
              backgroundColor: application.infoSessionsAttended > 0 ? '#10b981' : '#ef4444',
              color: 'white',
            }}
          >
            Info Sessions: {application.infoSessionsAttended}
          </span>
          {application.avgRating !== null && (
            <span className="badge badge-success">
              ⭐ {application.avgRating.toFixed(2)} ({application.ratingsCount})
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
          <strong>EID:</strong> {application.eid}
        </p>
        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
          <strong>Email:</strong> {showName ? application.email : '••••••@••••.•••'}
        </p>
        {application.headshotUrl && (
          <p style={{ margin: '0.25rem 0' }}>
            <a href={application.headshotUrl} target="_blank" rel="noopener noreferrer" className="link">
              📸 View Headshot
            </a>
          </p>
        )}
        {application.resumeUrl && (
          <p style={{ margin: '0.25rem 0' }}>
            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="link">
              📄 View Resume
            </a>
          </p>
        )}
      </div>

      {/* Essays Section - Single Dropdown */}
      <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => setShowEssays(!showEssays)}
          style={{
            backgroundColor: 'var(--baxa-purple-bg)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--baxa-purple-dark)',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {showEssays ? '▼' : '▶'} Essays
        </button>
        {showEssays && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            {/* Returning Member Essays */}
            {application.isReturningPath && (
              <>
                {application.events && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Which coffee chats did you attend?</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.events}</p>
                  </div>
                )}
                {application.returningEssay1 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Tell us about yourself - 250 words or less.</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningEssay1}</p>
                  </div>
                )}
                {application.returningReEngage && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>How do you hope to re-engage with BAXA and make the most of your membership moving forward? - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningReEngage}</p>
                  </div>
                )}
                {application.returningFavoriteMemory && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>What was your favorite memory from BAXA and why? - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningFavoriteMemory}</p>
                  </div>
                )}
                {application.returningEssay2 && (
                  <div>
                    <strong>What is something in BAXA you hope to be more involved with this semester? - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningEssay2}</p>
                  </div>
                )}
              </>
            )}

            {/* New Member Essays */}
            {!application.isReturningPath && (
              <>
                {application.newEssay1 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Why do you want to be a part of BAXA? - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.newEssay1}</p>
                  </div>
                )}
                {application.analyticsExperience && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>What experience do you have with data analytics or data science? (Experience isn't required - just want to make sure we're meeting members' needs!) - 50 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.analyticsExperience}</p>
                  </div>
                )}
                {application.lunch && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Which person (dead or alive) would you want to have lunch with and why? - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.lunch}</p>
                  </div>
                )}
                {application.newEssay2 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Tell us about yourself! - 250 words or less</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.newEssay2}</p>
                  </div>
                )}
                {application.timeCommitments && (
                  <div>
                    <strong>What are your other time commitments this semester?</strong>
                    <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.timeCommitments}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {application.anythingElse && (
        <div style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            style={{
              backgroundColor: 'var(--baxa-purple-bg)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              color: 'var(--baxa-purple-dark)',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {showAdditional ? '▼' : '▶'} Additional Information
          </button>
          {showAdditional && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <div>
                <strong>Anything else we should know? (OPTIONAL)</strong>
                <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.anythingElse}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Form */}
      <form onSubmit={handleSubmit} style={{ 
        borderTop: '1px solid var(--card-border)', 
        paddingTop: '1rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: '0.5rem' 
          }}>
            Your Rating (1-5)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid',
                  borderColor: rating === val ? 'var(--baxa-purple)' : 'var(--card-border)',
                  backgroundColor: rating === val ? 'var(--baxa-purple-bg)' : 'white',
                  color: rating === val ? 'var(--baxa-purple-dark)' : 'var(--text-primary)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: rating === val ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor={`comment-${application.eid}`} style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: '0.5rem' 
          }}>
            Comment (optional)
          </label>
          <textarea
            id={`comment-${application.eid}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your thoughts..."
            style={{ 
              width: '375px', 
              maxWidth: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--card-border)',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '3rem'
            }}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={rating === null || isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  )
}
