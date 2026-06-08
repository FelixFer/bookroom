'use client'

import { createPortal } from 'react-dom'

export function LoaderDots() {
  return (
    <span className="loader-dots" aria-label="Loading" role="status">
      <span>■</span>
      <span>■</span>
      <span>■</span>
    </span>
  )
}

export function LoaderOverlay() {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="loader-overlay" aria-hidden="true">
      <div className="loader-overlay__box">
        <LoaderDots />
      </div>
    </div>,
    document.body,
  )
}
