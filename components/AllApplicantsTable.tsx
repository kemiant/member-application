'use client'

import { useState, useEffect } from 'react'
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
    coffeeChatCount: number
    rowNumber: number
    headshotUrl: string
    email: string
    notes: string
  }>
}

export default function AllApplicantsTable({ allRatings }: AllApplicantsTableProps) {
  const [selectedEid, setSelectedEid] = useState<string | null>(null)
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set())
  const [applicantStatus, setApplicantStatus] = useState<Map<string, 'accepted' | 'declined' | 'leaning-yes' | 'leaning-no'>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [editingNoteEid, setEditingNoteEid] = useState<string | null>(null)
  const [applicantNotes, setApplicantNotes] = useState<Map<string, string>>(new Map())

  // Load existing statuses on mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const response = await fetch('/api/status')
        if (response.ok) {
          const data = await response.json()
          const statusMap = new Map<string, 'accepted' | 'declined' | 'leaning-yes' | 'leaning-no'>()
          Object.entries(data).forEach(([eid, status]) => {
            if (status === 'accepted' || status === 'declined' || status === 'leaning-yes' || status === 'leaning-no') {
              statusMap.set(eid, status as any)
            }
          })
          setApplicantStatus(statusMap)
        }
      } catch (error) {
        console.error('Failed to load statuses:', error)
      }
    }
    loadStatuses()
  }, [])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplicants(new Set(allRatings.map(app => app.eid)))
    } else {
      setSelectedApplicants(new Set())
    }
  }

  const handleSelectOne = (eid: string, checked: boolean) => {
    const newSelected = new Set(selectedApplicants)
    if (checked) {
      newSelected.add(eid)
    } else {
      newSelected.delete(eid)
    }
    setSelectedApplicants(newSelected)
  }

  const handleBulkAction = async (action: 'accepted' | 'declined' | 'leaning-yes' | 'leaning-no') => {
    setIsLoading(true)
    const newStatus = new Map(applicantStatus)
    const updates = Array.from(selectedApplicants).map(eid => ({
      eid,
      status: action,
    }))
    
    // Optimistically update UI
    selectedApplicants.forEach(eid => {
      newStatus.set(eid, action)
    })
    setApplicantStatus(newStatus)
    setSelectedApplicants(new Set()) // Clear selection after action

    // Persist to Google Sheets
    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save status')
      }
    } catch (error) {
      console.error('Failed to save status:', error)
      alert('Failed to save status. Please try again.')
      // Revert on error
      const revertedStatus = new Map(applicantStatus)
      updates.forEach(({ eid }) => {
        if (!applicantStatus.has(eid)) {
          revertedStatus.delete(eid)
        }
      })
      setApplicantStatus(revertedStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const copySelectedEmails = () => {
    const emails = allRatings
      .filter(app => selectedApplicants.has(app.eid))
      .map(app => app.email)
      .filter(email => email)
      .join(', ')
    
    navigator.clipboard.writeText(emails)
    alert(`Copied ${emails.split(', ').length} email(s) to clipboard!`)
  }

  const copyStatusEmails = (status: 'accepted' | 'declined' | 'leaning-yes' | 'leaning-no') => {
    const emails = allRatings
      .filter(app => applicantStatus.get(app.eid) === status)
      .map(app => app.email)
      .filter(email => email)
      .join(', ')
    
    if (emails) {
      navigator.clipboard.writeText(emails)
      alert(`Copied ${emails.split(', ').length} ${status} email(s) to clipboard!`)
    } else {
      alert(`No ${status} applicants to copy`)
    }
  }

  const handleNoteChange = (eid: string, note: string) => {
    const newNotes = new Map(applicantNotes)
    newNotes.set(eid, note)
    setApplicantNotes(newNotes)
  }

  const handleNoteSave = async (eid: string) => {
    setEditingNoteEid(null)
    // TODO: Add API call to save notes to Google Sheets
    // For now, notes are stored in local state only
  }

  const acceptedCount = Array.from(applicantStatus.values()).filter(s => s === 'accepted').length
  const leaningYesCount = Array.from(applicantStatus.values()).filter(s => s === 'leaning-yes').length
  const leaningNoCount = Array.from(applicantStatus.values()).filter(s => s === 'leaning-no').length
  const declinedCount = Array.from(applicantStatus.values()).filter(s => s === 'declined').length

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedApplicants.size > 0 && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--baxa-purple-bg)',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--baxa-purple)' }}>
            {selectedApplicants.size} selected
          </span>
          <button
            onClick={() => handleBulkAction('accepted')}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isLoading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Saving...' : '✓ Mark as Accepted'}
          </button>
          <button
            onClick={() => handleBulkAction('declined')}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isLoading ? '#ccc' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Saving...' : '✗ Mark as Declined'}
          </button>
          <button
            onClick={() => handleBulkAction('leaning-yes')}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isLoading ? '#ccc' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Saving...' : '↗ Leaning Yes'}
          </button>
          <button
            onClick={() => handleBulkAction('leaning-no')}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isLoading ? '#ccc' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Saving...' : '↘ Leaning No'}
          </button>
          <button
            onClick={copySelectedEmails}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--baxa-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            📋 Copy Emails
          </button>
        </div>
      )}

      {/* Status Summary Bar */}
      {(acceptedCount > 0 || leaningYesCount > 0 || leaningNoCount > 0 || declinedCount > 0) && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600 }}>Status Summary:</span>
          {acceptedCount > 0 && (
            <>
              <span style={{ color: '#10b981', fontWeight: 600 }}>
                ✓ {acceptedCount} Accepted
              </span>
              <button
                onClick={() => copyStatusEmails('accepted')}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Copy Emails
              </button>
            </>
          )}
          {leaningYesCount > 0 && (
            <>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                ↗ {leaningYesCount} Leaning Yes
              </span>
              <button
                onClick={() => copyStatusEmails('leaning-yes')}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Copy Emails
              </button>
            </>
          )}
          {leaningNoCount > 0 && (
            <>
              <span style={{ color: '#f97316', fontWeight: 600 }}>
                ↘ {leaningNoCount} Leaning No
              </span>
              <button
                onClick={() => copyStatusEmails('leaning-no')}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Copy Emails
              </button>
            </>
          )}
          {declinedCount > 0 && (
            <>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>
                ✗ {declinedCount} Declined
              </span>
              <button
                onClick={() => copyStatusEmails('declined')}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Copy Emails
              </button>
            </>
          )}
        </div>
      )}

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
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={selectedApplicants.size === allRatings.length && allRatings.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Row</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Major</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Year</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Path</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Coffee Chats</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Avg Rating</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {allRatings.map((app, index) => {
              const status = applicantStatus.get(app.eid)
              const isSelected = selectedApplicants.has(app.eid)
              
              return (
              <tr 
                key={app.eid}
                style={{ 
                  borderBottom: '1px solid var(--card-border)',
                  backgroundColor: status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                                   status === 'leaning-yes' ? 'rgba(59, 130, 246, 0.08)' :
                                   status === 'leaning-no' ? 'rgba(249, 115, 22, 0.08)' :
                                   status === 'declined' ? 'rgba(239, 68, 68, 0.1)' :
                                   index % 2 === 0 ? 'white' : '#f9fafb'
                }}
              >
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectOne(app.eid, e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {status === 'accepted' && (
                    <span style={{ 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ✓ Accepted
                    </span>
                  )}
                  {status === 'leaning-yes' && (
                    <span style={{ 
                      backgroundColor: '#3b82f6', 
                      color: 'white', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ↗ Leaning Yes
                    </span>
                  )}
                  {status === 'leaning-no' && (
                    <span style={{ 
                      backgroundColor: '#f97316', 
                      color: 'white', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ↘ Leaning No
                    </span>
                  )}
                  {status === 'declined' && (
                    <span style={{ 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ✗ Declined
                    </span>
                  )}
                </td>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {app.firstName} {app.lastName}
                    {app.headshotUrl && (
                      <a 
                        href={app.headshotUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                        title="View headshot"
                      >
                        <svg 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="#8855bb" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          style={{ opacity: 0.7 }}
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </a>
                    )}
                  </span>
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
                      backgroundColor: app.coffeeChatCount > 0 ? '#10b981' : '#6b7280',
                      color: 'white',
                    }}
                  >
                    {app.coffeeChatCount}
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
                  minWidth: '200px',
                }}>
                  {editingNoteEid === app.eid ? (
                    <input
                      type="text"
                      value={applicantNotes.get(app.eid) || ''}
                      onChange={(e) => handleNoteChange(app.eid, e.target.value)}
                      onBlur={() => handleNoteSave(app.eid)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNoteSave(app.eid)
                        } else if (e.key === 'Escape') {
                          setEditingNoteEid(null)
                        }
                      }}
                      autoFocus
                      placeholder="Add notes..."
                      style={{
                        width: '100%',
                        padding: '0.25rem 0.5rem',
                        border: '1px solid var(--baxa-purple)',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingNoteEid(app.eid)}
                      style={{
                        cursor: 'text',
                        minHeight: '1.5rem',
                        color: applicantNotes.get(app.eid) ? 'inherit' : 'var(--text-secondary)',
                        fontStyle: applicantNotes.get(app.eid) ? 'normal' : 'italic',
                        fontSize: '0.875rem'
                      }}
                    >
                      {applicantNotes.get(app.eid) || 'Click to add notes...'}
                    </div>
                  )}
                </td>
              </tr>
            )})}
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
