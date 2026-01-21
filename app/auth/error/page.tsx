'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import '@/styles/theme.css'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--baxa-purple-bg)'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ 
          color: 'var(--error)', 
          marginTop: 0,
          fontSize: '1.5rem',
          marginBottom: '1rem'
        }}>
          Authentication Error
        </h1>
        
        {error === 'AccessDenied' ? (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Access is restricted to authorized accounts only. Please sign in with the authorized email address.
            </p>
            <p style={{ 
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              color: '#991b1b',
              marginBottom: '1.5rem'
            }}>
              <strong>Note:</strong> Only texasbaxassociation@gmail.com is authorized to access this application.
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            An error occurred during authentication. Please try again.
          </p>
        )}

        <Link href="/api/auth/signin" className="btn-primary" style={{ 
          display: 'inline-block',
          textDecoration: 'none',
          textAlign: 'center',
          width: '100%'
        }}>
          Try Again
        </Link>
      </div>
    </div>
  )
}
