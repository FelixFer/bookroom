import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import { KanbanBoard } from './KanbanBoard'

export const metadata = {
  title: 'My Collection',
  description: 'Organize your books with a Kanban board. Drag and drop books between reading statuses.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function CollectionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  return <KanbanBoard />
}
