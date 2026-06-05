import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { RoomScene } from "@/app/_components/room/RoomScene";
import { LandingScreen } from "@/app/_components/LandingScreen";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <LandingScreen />;

  const userName = session.user.name ?? session.user.email ?? "";
  return <RoomScene userName={userName} />;
}
