'use client'

import { useEffect } from 'react'

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const RoomModal = ({ open, title, onClose, children }: Props) => {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      <div
        className={`room-backdrop${open ? ' room-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`room-modal${open ? ' room-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
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
        <div className="room-modal__content">{children}</div>
      </div>
    </>
  )
}
