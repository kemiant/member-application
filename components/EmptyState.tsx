'use client'

export default function EmptyState({ message = "No applications found matching your filters" }: { message?: string }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '2px dashed var(--card-border)',
      margin: '2rem 0'
    }}>
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 120 120" 
        fill="none" 
        style={{ margin: '0 auto 1.5rem' }}
      >
        {/* Document icon */}
        <rect x="30" y="20" width="60" height="80" rx="4" fill="#f5f0ff" stroke="#8B6BB7" strokeWidth="2"/>
        <line x1="40" y1="35" x2="80" y2="35" stroke="#8B6BB7" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40" y1="45" x2="80" y2="45" stroke="#8B6BB7" strokeWidth="2" strokeLinecap="round"/>
        <line x1="40" y1="55" x2="70" y2="55" stroke="#8B6BB7" strokeWidth="2" strokeLinecap="round"/>
        {/* Search icon */}
        <circle cx="75" cy="75" r="15" fill="white" stroke="#8B6BB7" strokeWidth="3"/>
        <line x1="86" y1="86" x2="98" y2="98" stroke="#8B6BB7" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <h3 style={{ 
        color: 'var(--baxa-purple-dark)', 
        marginBottom: '0.5rem',
        fontSize: '1.25rem'
      }}>
        {message}
      </h3>
      <p style={{ 
        color: 'var(--text-secondary)', 
        marginTop: 0 
      }}>
        Try adjusting your filters or search criteria
      </p>
    </div>
  )
}
