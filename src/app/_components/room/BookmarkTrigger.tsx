"use client";

import { useState } from "react";

type Props = {
  onClick?: () => void;
};

export const BookMarkTrigger = ({ onClick }: Props) => {
  const [animating, setAnimating] = useState(false);

  function handleClick() {
    if (animating) return;
    setAnimating(true);
    onClick?.();
  }

  return (
    <button
      className={`bookmark${animating ? " bookmark--clicked" : ""}`}
      onClick={handleClick}
      onAnimationEnd={() => setAnimating(false)}
      aria-label="Open bookmarks"
    />
  );
};
