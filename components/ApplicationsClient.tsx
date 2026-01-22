'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ApplicationCard from '@/components/ApplicationCard'
import RaterNameGate from '@/components/RaterNameGate'
import AssignedRowsFilter, { parseAssignedRows } from '@/components/AssignedRowsFilter'
import Navigation from '@/components/Navigation'

interface Application {
  eid: string
  rowNumber: number
  timestamp: string
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
}

export default function ApplicationsClient() {
  const searchParams = useSearchParams()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApps, setFilteredApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [raterName, setRaterName] = useState('')
  const [assignedRowsInput, setAssignedRowsInput] = useState('')
  
  // Filters
  const [pathFilter, setPathFilter] = useState<'all' | 'returning' | 'new'>('all')
  const [yearFilter, setYearFilter] = useState('')
  const [majorFilter, setMajorFilter] = useState('')
  const [eidFilter, setEidFilter] = useState('')
  const [textSearch, setTextSearch] = useState('')
  const [assignedRows, setAssignedRows] = useState<Set<number>>(new Set())

  // Check for EID in URL params and set it as filter
  useEffect(() => {
    const eidParam = searchParams.get('eid')
    if (eidParam) {
      setEidFilter(eidParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applications, pathFilter, yearFilter, majorFilter, eidFilter, textSearch, assignedRows])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...applications]

    // Path filter
    if (pathFilter === 'returning') {
      filtered = filtered.filter(app => app.isReturningPath)
    } else if (pathFilter === 'new') {
      filtered = filtered.filter(app => !app.isReturningPath)
    }

    // Year filter
    if (yearFilter) {
      filtered = filtered.filter(app => app.year === yearFilter)
    }

    // Major filter
    if (majorFilter) {
      filtered = filtered.filter(app => app.primaryMajor === majorFilter)
    }

    // EID filter
    if (eidFilter) {
      filtered = filtered.filter(app => 
        app.eid.toLowerCase().includes(eidFilter.toLowerCase())
      )
    }

    // Text search
    if (textSearch) {
      const search = textSearch.toLowerCase()
      filtered = filtered.filter(app => 
        app.firstName.toLowerCase().includes(search) ||
        app.lastName.toLowerCase().includes(search) ||
        app.email.toLowerCase().includes(search) ||
        app.returningEssay1.toLowerCase().includes(search) ||
        app.returningEssay2.toLowerCase().includes(search) ||
        app.newEssay1.toLowerCase().includes(search) ||
        app.newEssay2.toLowerCase().includes(search) ||
        app.newEssay3.toLowerCase().includes(search)
      )
    }

    // Assigned rows filter
    if (assignedRows.size > 0) {
      filtered = filtered.filter(app => assignedRows.has(app.rowNumber))
    }

    setFilteredApps(filtered)
  }

  const handleRate = async (eid: string, rating: number, comment: string) => {
    await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        eid, 
        rating, 
        raterName, 
        comment,
        assignedRows: assignedRowsInput
      }),
    })
    // Refresh applications to show updated rating
    fetchApplications()
  }

  // Get unique years and majors for filters
  const years = Array.from(new Set(applications.map(app => app.year))).sort()
  const majors = Array.from(new Set(applications.map(app => app.primaryMajor))).filter(Boolean).sort()

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading applications...</p>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ 
          marginBottom: '1.5rem', 
          color: 'var(--baxa-purple-dark)',
          fontSize: '2rem'
        }}>
          BAXA Member Applications
        </h1>

      <RaterNameGate onReady={setRaterName} />

      {raterName && (
        <>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Filters
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))',
              gap: '0.75rem'
            }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Path
                </label>
                <select 
                  className="select" 
                  value={pathFilter}
                  onChange={(e) => setPathFilter(e.target.value as any)}
                  style={{ width: '100%' }}
                >
                  <option value="all">All</option>
                  <option value="returning">Returning</option>
                  <option value="new">New</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Year
                </label>
                <select 
                  className="select"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Major
                </label>
                <select 
                  className="select"
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">All Majors</option>
                  {majors.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                  EID
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Search by EID"
                  value={eidFilter}
                  onChange={(e) => setEidFilter(e.target.value)}
                  style={{ width: '100%', maxWidth: '150px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', marginLeft: '-40px' }}>
                  Text Search
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Search name, email, essays..."
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  style={{ width: '100%', maxWidth: '220px', marginLeft: '-40px' }}
                />
              </div>

              <div>
                <AssignedRowsFilter 
                  onChange={(rows) => {
                    setAssignedRows(rows)
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredApps.length} of {applications.length} applications
            </p>
          </div>

          {/* Applications grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredApps.map(app => (
              <ApplicationCard
                key={app.eid}
                application={app}
                onRate={handleRate}
              />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                No applications match your filters
              </p>
            </div>
          )}
        </>
      )}
      </div>
    </>
  )
}
