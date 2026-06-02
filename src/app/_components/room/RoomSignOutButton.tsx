"use client";

import { signOut } from "next-auth/react";

type Props = { userName: string };

export const RoomSignOutButton = ({ userName }: Props) => {
  const initial = userName.trim().charAt(0).toUpperCase() || "?";
  return (
    <button
      className="room-signout"
      onClick={() => signOut()}
      aria-label="Sign out"
    >
      <span className="room-signout__avatar">{initial}</span>
      <span className="room-signout__name">{userName || "Sign out"}</span>
      <span aria-hidden="true">⏻</span>
    </button>
  );
};
