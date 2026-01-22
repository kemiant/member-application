'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav style={{
      backgroundColor: 'var(--baxa-purple)',
      padding: '1rem 2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
      }}>
        <h1 style={{
          margin: 0,
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          BAXA Applications
        </h1>
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
        </div>
      </div>
    </nav>
  )
}
