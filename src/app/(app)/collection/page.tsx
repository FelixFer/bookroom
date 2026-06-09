import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import { KanbanBoard } from './KanbanBoard'

export const metadata = { title: 'My Collection — Bookroom' }

export default async function CollectionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  return <KanbanBoard />
}
