"use client";

import { useEffect } from "react";
import { useTheme } from "../../ThemeContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const RelaxOverlay = ({ open, onClose }: Props) => {
  const { isDark } = useTheme();
  const relaxBg = isDark ? "/room-relax-night.png" : "/room-relax-day.png";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="relax-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Relax mode"
    >
      <div>
        <img
          className="room-bg"
          src={relaxBg}
          alt="Cozy pixel-art room"
          draggable={false}
        />
      </div>
      <p className="relax-overlay__hint">click anywhere or press Esc to return</p>
    </div>
  );
};
