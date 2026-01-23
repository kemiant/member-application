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
  majors?: string[]
  schools?: string[]
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
  coffeeChatCount: number
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
      className={notConsidered ? "card card-not-considered" : "card card-normal"}
    >
      {notConsidered && (
        <div className="not-considered-overlay" />
      )}
      <div className="card-header card-header-content">
        <div className="header-row">
          <div className="header-left">
            <h3 className="card-title title-no-margin">
              {showName ? `${application.firstName} ${application.lastName}` : `Applicant ${application.rowNumber}`}
            </h3>
            <button
              onClick={() => setShowName(!showName)}
              className="reveal-button"
            >
              {showName ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2"></line>
                  </svg>
                  Hide
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Reveal
                </>
              )}
            </button>
            {application.avgRating !== null && (
              <span className="badge-rated">
                ✓ Rated
              </span>
            )}
          </div>
          {notConsidered && (
            <span className="badge-not-considered">
              🔴 NOT<br/>CONSIDERED
            </span>
          )}
        </div>
        <div className="badge-container">
          <span className="badge badge-purple">Row {application.rowNumber}</span>
          <span className="badge badge-purple">{application.year}</span>
          {application.schools && application.schools.length > 0 && application.schools[0] && 
           application.schools[0].trim() && application.schools[0].toLowerCase() !== 'n/a' && (
            <span className="badge badge-school">
              {application.schools[0]}
            </span>
          )}
          {application.isReturningPath && (
            <span className="badge badge-warning">Returning</span>
          )}
          {application.previouslyMember?.toLowerCase().startsWith('y') && (
            <span className="badge badge-previous-member">Previous Member</span>
          )}
          {application.appliedBefore?.toLowerCase().startsWith('y') && (
            <span className="badge badge-applied-before">Applied Before</span>
          )}
          <span 
            className={application.infoSessionsAttended > 0 ? "badge badge-info-sessions-positive" : "badge badge-info-sessions-zero"}
          >
            Info Sessions: {application.infoSessionsAttended}
          </span>
          <span 
            className={application.coffeeChatCount > 0 ? "badge badge-info-sessions-positive" : "badge badge-info-sessions-zero"}
          >
            Coffee Chats: {application.coffeeChatCount}
          </span>
          {application.avgRating !== null && (
            <span className="badge badge-success">
              ⭐ {application.avgRating.toFixed(2)} ({application.ratingsCount})
            </span>
          )}
        </div>
      </div>

      <div className="info-section">
        <p className="info-text">
          <strong>EID:</strong> {application.eid}
        </p>
        <p className="info-text">
          <strong>Email:</strong> {showName ? application.email : '••••••@••••.•••'}
        </p>
        {application.headshotUrl && (
          <p className="info-text-normal">
            <a 
              href={application.headshotUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link link-with-icon"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              View Headshot
            </a>
          </p>
        )}
        {application.resumeUrl && (
          <p className="info-text-normal">
            <a 
              href={application.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="link link-with-icon"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View Resume
            </a>
          </p>
        )}
      </div>

      {/* Essays Section - Single Dropdown */}
      <div className="info-section">
        <button
          onClick={() => setShowEssays(!showEssays)}
          className="dropdown-button"
        >
          {showEssays ? '▼' : '▶'} Essays
        </button>
        {showEssays && (
          <div className="dropdown-content">
            {/* Returning Member Essays */}
            {application.isReturningPath && (
              <>
                {application.events && (
                  <div className="essay-section">
                    <strong>Which coffee chats did you attend?</strong>
                    <p className="essay-text">{application.events}</p>
                  </div>
                )}
                {application.returningEssay1 && (
                  <div className="essay-section">
                    <strong>Tell us about yourself - 250 words or less.</strong>
                    <p className="essay-text">{application.returningEssay1}</p>
                  </div>
                )}
                {application.returningReEngage && (
                  <div className="essay-section">
                    <strong>How do you hope to re-engage with BAXA and make the most of your membership moving forward? - 250 words or less</strong>
                    <p className="essay-text">{application.returningReEngage}</p>
                  </div>
                )}
                {application.returningFavoriteMemory && (
                  <div className="essay-section">
                    <strong>What was your favorite memory from BAXA and why? - 250 words or less</strong>
                    <p className="essay-text">{application.returningFavoriteMemory}</p>
                  </div>
                )}
                {application.returningEssay2 && (
                  <div>
                    <strong>What is something in BAXA you hope to be more involved with this semester? - 250 words or less</strong>
                    <p className="essay-text">{application.returningEssay2}</p>
                  </div>
                )}
              </>
            )}

            {/* New Member Essays */}
            {!application.isReturningPath && (
              <>
                {application.newEssay1 && (
                  <div className="essay-section">
                    <strong>Why do you want to be a part of BAXA? - 250 words or less</strong>
                    <p className="essay-text">{application.newEssay1}</p>
                  </div>
                )}
                {application.analyticsExperience && (
                  <div className="essay-section">
                    <strong>What experience do you have with data analytics or data science? (Experience isn't required - just want to make sure we're meeting members' needs!) - 50 words or less</strong>
                    <p className="essay-text">{application.analyticsExperience}</p>
                  </div>
                )}
                {application.lunch && (
                  <div className="essay-section">
                    <strong>Which person (dead or alive) would you want to have lunch with and why? - 250 words or less</strong>
                    <p className="essay-text">{application.lunch}</p>
                  </div>
                )}
                {application.newEssay2 && (
                  <div className="essay-section">
                    <strong>Tell us about yourself! - 250 words or less</strong>
                    <p className="essay-text">{application.newEssay2}</p>
                  </div>
                )}
                {application.timeCommitments && (
                  <div>
                    <strong>What are your other time commitments this semester?</strong>
                    <p className="essay-text">{application.timeCommitments}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {application.anythingElse && (
        <div className="info-section">
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            className="dropdown-button"
          >
            {showAdditional ? '▼' : '▶'} Additional Information
          </button>
          {showAdditional && (
            <div className="dropdown-content">
              <div>
                <strong>Anything else we should know? (OPTIONAL)</strong>
                <p className="essay-text">{application.anythingElse}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Form */}
      <form onSubmit={handleSubmit} className="rating-form">
        <div className="rating-form-group">
          <label className="rating-label">
            Your Rating (1-5)
          </label>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                className={rating === val ? "rating-button rating-button-selected" : "rating-button rating-button-unselected"}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div className="rating-form-group">
          <label htmlFor={`comment-${application.eid}`} className="rating-label">
            Comment (optional)
          </label>
          <textarea
            id={`comment-${application.eid}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your thoughts..."
            className="comment-textarea"
          />
        </div>

        <button
          type="submit"
          className="btn-primary btn-full-width"
          disabled={rating === null || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  )
}
