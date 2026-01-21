import type { Metadata } from 'next'
import '@/styles/theme.css'

export const metadata: Metadata = {
  title: 'BAXA Member Applications',
  description: 'Review and rate BAXA member applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
