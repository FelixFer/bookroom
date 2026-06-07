"use client";

import { useState } from "react";

type Props = {
  classname?: string;
  onClick?: () => void;
};

export const BookMarkTrigger = ({ classname, onClick }: Props) => {
  const [animating, setAnimating] = useState(false);

  function handleClick() {
    if (animating) return;
    setAnimating(true);
    onClick?.();
  }

  return (
    <button
      className={`bookmark${animating ? " bookmark--clicked" : ""} ${classname}`}
      onClick={handleClick}
      onAnimationEnd={() => setAnimating(false)}
      aria-label="Open bookmarks"
    />
  );
};
