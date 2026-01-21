'use client'

import { signIn } from 'next-auth/react'
import '@/styles/theme.css'

export default function SignIn() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--baxa-purple-bg)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ 
          color: 'var(--baxa-purple-dark)', 
          marginTop: 0,
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          BAXA Applications
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '2rem' 
        }}>
          Sign in to review member applications
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/applications' })}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem 1.5rem' }}
        >
          Sign in with Google
        </button>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-muted)', 
          marginTop: '1rem',
          marginBottom: 0
        }}>
          Access restricted to authorized accounts only
        </p>
      </div>
    </div>
  )
}
