import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { RoomSignOutButton } from "@/app/_components/room/RoomSignOutButton";
import { BookMarkTrigger } from "@/app/_components/room/BookmarkTrigger";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <>
      {session && (
        <div>
          <BookMarkTrigger />
          <RoomSignOutButton userName={userName} />
        </div>
      )}
      {children}
    </>
  );
}
