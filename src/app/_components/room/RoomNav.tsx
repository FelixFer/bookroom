"use client";

import { usePathname } from "next/navigation";
import { BookMarkTrigger } from "@/app/_components/room/BookmarkTrigger";
import { RoomSignOutButton } from "@/app/_components/room/RoomSignOutButton";

type Props = {
  userName: string;
};

export const RoomNav = ({ userName }: Props) => {
  const pathname = usePathname();
  const isCollection = pathname === "/collection";

  return (
    <div>
      {!isCollection && <BookMarkTrigger classname="left-4" />}
      <RoomSignOutButton userName={userName} />
    </div>
  );
};
