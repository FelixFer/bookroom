"use client";

import { signOut } from "next-auth/react";
import { DarkModeToggle } from "./DarkModeToggle";

type Props = { userName: string };

export const RoomSignOutButton = ({ userName }: Props) => {
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="room-signout-group">
      <DarkModeToggle />
      <button
        className="room-signout"
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label="Sign out"
      >
        <span className="room-signout__avatar">{initial}</span>
        <span className="room-signout__name">{userName || "Sign out"}</span>
        <span aria-hidden="true">⏻</span>
      </button>
    </div>
  );
};
