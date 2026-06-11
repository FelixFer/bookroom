'use client'

import { useEffect, useRef } from 'react'

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const RoomDrawer = ({ open, title, onClose, children }: Props) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      returnRef.current?.focus()
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`room-backdrop${open ? ' room-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`room-drawer${open ? ' room-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="room-drawer__header">
          <span className="room-drawer__title">{title}</span>
          <button
            ref={closeRef}
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
  )
}
