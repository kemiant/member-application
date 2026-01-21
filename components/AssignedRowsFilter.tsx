'use client'

interface AssignedRowsFilterProps {
  onChange: (rows: Set<number>) => void
}

export function parseAssignedRows(input: string): Set<number> {
  const rows = new Set<number>()
  
  if (!input.trim()) {
    return rows
  }

  // Split by comma
  const parts = input.split(',').map(p => p.trim())
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Range like "12-25"
      const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10))
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          rows.add(i)
        }
      }
    } else {
      // Single number
      const num = parseInt(part, 10)
      if (!isNaN(num)) {
        rows.add(num)
      }
    }
  }
  
  return rows
}

export default function AssignedRowsFilter({ onChange }: AssignedRowsFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rows = parseAssignedRows(e.target.value)
    onChange(rows)
  }

  return (
    <div>
      <label htmlFor="assignedRows" style={{ 
        display: 'block', 
        fontWeight: 500, 
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
      }}>
        Assigned Rows
      </label>
      <input
        id="assignedRows"
        type="text"
        className="input"
        placeholder="e.g., 12-25,40,42-45"
        onChange={handleChange}
      />
      <p style={{ 
        fontSize: '0.875rem', 
        color: 'var(--text-secondary)', 
        marginTop: '0.25rem' 
      }}>
        Enter row numbers or ranges separated by commas
      </p>
    </div>
  )
}
