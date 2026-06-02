"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const RoomDrawer = ({ open, title, onClose, children }: Props) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`room-backdrop${open ? " room-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`room-drawer${open ? " room-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="room-drawer__header">
          <span className="room-drawer__title">{title}</span>
          <button
            className="room-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="room-drawer__content">{children}</div>
      </aside>
    </>
  );
};
