'use client'

import { useEffect, useState } from 'react'

interface RaterNameGateProps {
  onReady: (name: string) => void
}

export default function RaterNameGate({ onReady }: RaterNameGateProps) {
  const [raterName, setRaterName] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    // Check localStorage for existing rater name
    const stored = localStorage.getItem('baxa:raterName')
    if (stored) {
      setRaterName(stored)
      setIsReady(true)
      onReady(stored)
    }
  }, [onReady])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      localStorage.setItem('baxa:raterName', inputValue.trim())
      setRaterName(inputValue.trim())
      setIsReady(true)
      onReady(inputValue.trim())
    }
  }

  const handleChange = () => {
    localStorage.removeItem('baxa:raterName')
    setIsReady(false)
    setRaterName('')
  }

  if (isReady) {
    return (
      <div style={{ 
        padding: '0.75rem 1rem', 
        backgroundColor: 'var(--baxa-purple-bg)', 
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <span style={{ fontWeight: 500, color: 'var(--baxa-purple-dark)' }}>
          Rating as: <strong>{raterName}</strong>
        </span>
        <button
          onClick={handleChange}
          style={{
            padding: '0.25rem 0.75rem',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            border: '1px solid var(--baxa-purple)',
            color: 'var(--baxa-purple)',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ marginTop: 0, color: 'var(--baxa-purple-dark)' }}>
        Enter Your Name
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Please enter your name to continue. This will be saved locally and used for all ratings.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="Your full name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
          style={{ marginBottom: '0.75rem' }}
        />
        <button type="submit" className="btn-primary">
          Continue
        </button>
      </form>
    </div>
  )
}
