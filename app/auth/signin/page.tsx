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
      background: 'linear-gradient(135deg, #f5f0ff 0%, #e9e0ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(102, 51, 153, 0.3) 35px, rgba(102, 51, 153, 0.3) 70px),
          repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(102, 51, 153, 0.3) 35px, rgba(102, 51, 153, 0.3) 70px)
        `,
        pointerEvents: 'none'
      }} />
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <img 
          src="/baxa-logo.png" 
          alt="BAXA Logo" 
          style={{ height: '80px', width: 'auto', margin: '0 auto 1.5rem' }}
        />
        <h1 style={{ 
          color: 'var(--baxa-purple-dark)', 
          marginTop: 0,
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          Applications Portal
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
