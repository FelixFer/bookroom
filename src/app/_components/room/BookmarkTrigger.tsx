"use client";

import { useState } from "react";
import { RoomDrawer } from "./RoomDrawer";
import { BookmarkPanel } from "./panels/BookmarkPanel";

type Props = {
  classname?: string;
  onClick?: () => void;
};

export const BookMarkTrigger = ({ classname, onClick }: Props) => {
  const [animating, setAnimating] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  function handleClick() {
    if (animating) return;
    setAnimating(true);
    setShowPanel(true);
  }

  return (
    <>
      <button
        className={`bookmark${animating ? " bookmark--clicked" : ""} ${classname}`}
        onClick={handleClick}
        onAnimationEnd={() => setAnimating(false)}
        aria-label="Open bookmarks"
      />
      <RoomDrawer
        open={showPanel}
        title="Bookmarks"
        onClose={() => setShowPanel(false)}
      >
        <BookmarkPanel />
      </RoomDrawer>
    </>
  );
};
