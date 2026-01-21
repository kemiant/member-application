import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ApplicationsClient from '@/components/ApplicationsClient'
import '@/styles/theme.css'

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  return <ApplicationsClient />
}
