import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { RoomSignOutButton } from "@/app/_components/room/RoomSignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <>
      {session && <RoomSignOutButton userName={userName} />}
      {children}
    </>
  );
}
