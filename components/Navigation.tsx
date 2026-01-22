'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #663399 0%, #8855bb 100%)',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(102, 51, 153, 0.3)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/baxa-logo-white.png" 
            alt="BAXA Logo" 
            style={{ height: '105px', width: 'auto' }}
          />
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 600
          }}>
            Applications
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/applications"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: 500,
              backgroundColor: pathname === '/applications' ? 'white' : 'transparent',
              color: pathname === '/applications' ? 'var(--baxa-purple)' : 'white',
              border: pathname === '/applications' ? 'none' : '1px solid white',
              transition: 'all 0.2s'
            }}
          >
            Applications
          </Link>
          <Link
            href="/summary"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: 500,
              backgroundColor: pathname === '/summary' ? 'white' : 'transparent',
              color: pathname === '/summary' ? 'var(--baxa-purple)' : 'white',
              border: pathname === '/summary' ? 'none' : '1px solid white',
              transition: 'all 0.2s'
            }}
          >
            Summary
          </Link>
          <Link
            href="/faq"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: 500,
              backgroundColor: pathname === '/faq' ? 'white' : 'transparent',
              color: pathname === '/faq' ? 'var(--baxa-purple)' : 'white',
              border: pathname === '/faq' ? 'none' : '1px solid white',
              transition: 'all 0.2s'
            }}
          >
            FAQ
          </Link>
        </div>
      </div>
    </nav>
  )
}
