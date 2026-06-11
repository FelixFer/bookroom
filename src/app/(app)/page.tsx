import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'
import { RoomScene } from '@/app/_components/room/RoomScene'
import { LandingScreen } from '@/app/_components/LandingScreen'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return <LandingScreen />

  return (
    <>
      <h1 className="sr-only">Your Room</h1>
      <RoomScene />
    </>
  )
}
