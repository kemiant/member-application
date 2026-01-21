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
}

interface ApplicationCardProps {
  application: Application
  onRate: (eid: string, rating: number, comment: string) => Promise<void>
}

export default function ApplicationCard({ application, onRate }: ApplicationCardProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReturning, setShowReturning] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showAdditional, setShowAdditional] = useState(false)

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

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="card-header">
        <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
          {application.firstName} {application.lastName}
        </h3>
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
          {application.avgRating !== null && (
            <span className="badge badge-success">
              ⭐ {application.avgRating.toFixed(2)} ({application.ratingsCount})
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
          <strong>EID:</strong> {application.eid}
        </p>
        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
          <strong>Email:</strong> {application.email}
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

      {/* Returning Member Essays */}
      {application.isReturningPath && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowReturning(!showReturning)}
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
            {showReturning ? '▼' : '▶'} Returning Member Essays
          </button>
          {showReturning && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              {application.returningEssay1 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Essay 1:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningEssay1}</p>
                </div>
              )}
              {application.returningEssay2 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Essay 2:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningEssay2}</p>
                </div>
              )}
              {application.returningFavoriteMemory && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Favorite Memory:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningFavoriteMemory}</p>
                </div>
              )}
              {application.returningReEngage && (
                <div>
                  <strong>How to Re-engage:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.returningReEngage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* New Member Essays */}
      {!application.isReturningPath && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowNew(!showNew)}
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
            {showNew ? '▼' : '▶'} New Member Essays
          </button>
          {showNew && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              {application.newEssay1 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Essay 1:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.newEssay1}</p>
                </div>
              )}
              {application.newEssay2 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Essay 2:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.newEssay2}</p>
                </div>
              )}
              {application.newEssay3 && (
                <div>
                  <strong>Essay 3:</strong>
                  <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.newEssay3}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div style={{ marginBottom: '1rem' }}>
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
            {application.events && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Events:</strong>
                <p style={{ marginTop: '0.25rem' }}>{application.events}</p>
              </div>
            )}
            {application.analyticsExperience && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Analytics Experience:</strong>
                <p style={{ marginTop: '0.25rem' }}>{application.analyticsExperience}</p>
              </div>
            )}
            {application.lunch && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Lunch Preference:</strong>
                <p style={{ marginTop: '0.25rem' }}>{application.lunch}</p>
              </div>
            )}
            {application.timeCommitments && (
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Time Commitments:</strong>
                <p style={{ marginTop: '0.25rem' }}>{application.timeCommitments}</p>
              </div>
            )}
            {application.anythingElse && (
              <div>
                <strong>Anything Else:</strong>
                <p style={{ marginTop: '0.25rem' }}>{application.anythingElse}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Form */}
      <form onSubmit={handleSubmit} style={{ 
        borderTop: '1px solid var(--card-border)', 
        paddingTop: '1rem' 
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: '0.5rem' 
          }}>
            Your Rating (0-5)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[0, 1, 2, 3, 4, 5].map(val => (
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
            className="textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your thoughts..."
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
