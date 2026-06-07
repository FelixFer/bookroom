import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { RoomNav } from "@/app/_components/room/RoomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <>
      {session && <RoomNav userName={userName} />}
      {children}
    </>
  );
}
