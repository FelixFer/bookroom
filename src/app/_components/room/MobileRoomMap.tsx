'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

// ─── Constants ────────────────────────────────────────────────────────────────

const IMG_W = 1672
const IMG_H = 941
const MINIMAP_W = 90
const MINIMAP_H = Math.round(MINIMAP_W * (IMG_H / IMG_W)) // ~51px
const SWIPE_VELOCITY_THRESHOLD = 0.3 // px/ms

const ZONE_CENTERS = { left: 0.15, center: 0.50, right: 0.85 } as const
type Zone = keyof typeof ZONE_CENTERS;
const ZONE_ORDER: Zone[] = ['left', 'center', 'right']

type HotspotDef = {
  id: string;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const HOTSPOTS: HotspotDef[] = [
  { id: 'bookshelf-left', label: 'Add Book', top: 15, left: 9, width: 13.7, height: 38.5 },
  { id: 'bookshelf-right', label: 'Collection', top: 14, left: 79.3, width: 13.2, height: 49 },
  { id: 'window', label: 'Relax', top: 9, left: 30, width: 39.5, height: 41 },
  { id: 'statspaper', label: 'Stats', top: 34.2, left: 23, width: 1.6, height: 7.5 },
  { id: 'cat', label: 'Surprise', top: 80, left: 10, width: 19, height: 15.5 },
  { id: 'couch', label: 'Reading', top: 78, left: 40, width: 15, height: 15.5 },
  { id: 'globe', label: 'Discover', top: 1, left: 10.6, width: 9.25, height: 15 },
  { id: 'notebook', label: 'Notes', top: 52, left: 48, width: 10.5, height: 5 },
  { id: 'trash', label: 'Dropped', top: 71, left: 55, width: 4.8, height: 10 },
]

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function getImageWidth(): number {
  return window.innerHeight * (IMG_W / IMG_H)
}

function getMaxPan(): number {
  return Math.max(0, getImageWidth() - window.innerWidth)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function zoneToOffset(zone: Zone): number {
  const imgW = getImageWidth()
  const vpW = window.innerWidth
  const maxPan = Math.max(0, imgW - vpW)
  const raw = -(ZONE_CENTERS[zone] * imgW) + vpW / 2
  return clamp(raw, -maxPan, 0)
}

// ─── MobileHotspot ────────────────────────────────────────────────────────────

type HotspotProps = HotspotDef & {
  onTap: (id: string) => void;
  dragRef: React.RefObject<DragState | null>;
};

type DragState = {
  startX: number;
  startOffset: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  hasMoved: boolean;
};

const MobileHotspot = ({ id, label, top, left, width, height, onTap, dragRef }: HotspotProps) => (
  <button
    className="room-map__hotspot"
    data-id={id}
    aria-label={label}
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${width}%`,
      height: `${height}%`,
    }}
    onTouchEnd={(e) => {
      if (!dragRef.current?.hasMoved) {
        e.preventDefault() // suppress the follow-up synthetic click on touch devices
        e.stopPropagation()
        onTap(id)
      }
    }}
    onClick={() => {
      // Fallback for mouse clicks (DevTools emulation, desktop testing)
      // On real touch, onTouchEnd + preventDefault suppresses this event
      onTap(id)
    }}
  >
    <span className="room-map__hotspot-label">{label}</span>
  </button>
)

// ─── MobileMapMinimap ─────────────────────────────────────────────────────────

const MobileMapMinimap = ({
  offset,
  isDark,
  stageWidth,
}: {
  offset: number;
  isDark: boolean;
  stageWidth: number;
}) => {
  // Use the actual rendered stage offsetWidth as the source of truth.
  // Falls back to window-based estimate only before the first DOM measurement.
  const imgW = stageWidth > 0
    ? stageWidth
    : (typeof window !== 'undefined' ? getImageWidth() : IMG_W)
  const vpW = typeof window !== 'undefined' ? window.innerWidth : 375
  const rectW = Math.max(4, Math.round((vpW / imgW) * MINIMAP_W))
  const rectLeft = Math.round((-offset / imgW) * MINIMAP_W)

  return (
    <div className="room-map__minimap" style={{ height: MINIMAP_H }}>
      <Image
        className="room-map__minimap-img"
        src={isDark ? '/room-night.png' : '/room-day.png'}
        alt=""
        fill
        sizes="90px"
        unoptimized
      />
      <div
        className="room-map__minimap-rect"
        style={{ width: rectW, left: rectLeft }}
      />
    </div>
  )
}

// ─── MobileRoomMap ────────────────────────────────────────────────────────────

type Props = {
  isDark: boolean;
  onHotspot: (id: string) => void;
};

export const MobileRoomMap = ({ isDark, onHotspot }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)

  const [offset, setOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeZone, setActiveZone] = useState<Zone>('center')
  // Actual rendered stage width — ground truth for all pan/minimap calculations.
  // Avoids 100vh vs window.innerHeight discrepancy on mobile browsers.
  const [stageWidth, setStageWidth] = useState(0)

  // ── Snap to zone ────────────────────────────────────────────────────────────
  const snapToZone = useCallback((zone: Zone) => {
    setActiveZone(zone)
    setIsAnimating(true)
    setOffset(zoneToOffset(zone))
    setTimeout(() => setIsAnimating(false), 320)
  }, [])

  // ── Init + resize ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stageRef.current) setStageWidth(stageRef.current.offsetWidth)
    setOffset(zoneToOffset('center'))
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) setStageWidth(stageRef.current.offsetWidth)
      setOffset(zoneToOffset(activeZone))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeZone])

  // ── Non-passive touchmove to prevent page scroll ─────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: TouchEvent) => {
      if (drag.current) e.preventDefault()
    }
    el.addEventListener('touchmove', handler, { passive: false })
    return () => el.removeEventListener('touchmove', handler)
  }, [])

  // ── Touch handlers ───────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    drag.current = {
      startX: touch.clientX,
      startOffset: offset,
      lastX: touch.clientX,
      lastTime: e.timeStamp,
      velocity: 0,
      hasMoved: false,
    }
    setIsAnimating(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!drag.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - drag.current.startX

    if (Math.abs(dx) > 8) drag.current.hasMoved = true

    const maxPan = getMaxPan()
    const raw = drag.current.startOffset + dx
    const clamped = clamp(raw, -maxPan, 0)

    const dt = e.timeStamp - drag.current.lastTime
    if (dt > 0) {
      drag.current.velocity = (touch.clientX - drag.current.lastX) / dt
    }
    drag.current.lastX = touch.clientX
    drag.current.lastTime = e.timeStamp

    setOffset(clamped)
  }

  const handleTouchEnd = () => {
    if (!drag.current) return
    const { velocity } = drag.current
    drag.current = null

    const imgW = getImageWidth()
    const vpW = window.innerWidth
    const currentCenterFraction = (-offset + vpW / 2) / imgW

    let targetZone: Zone

    if (Math.abs(velocity) >= SWIPE_VELOCITY_THRESHOLD) {
      const currentIdx = ZONE_ORDER.indexOf(activeZone)
      if (velocity > 0) {
        // finger moved right → reveal left zone
        targetZone = ZONE_ORDER[Math.max(0, currentIdx - 1)]
      } else {
        // finger moved left → reveal right zone
        targetZone = ZONE_ORDER[Math.min(ZONE_ORDER.length - 1, currentIdx + 1)]
      }
    } else {
      // snap to nearest zone by center fraction
      const nearest = ZONE_ORDER.reduce((best, z) =>
        Math.abs(ZONE_CENTERS[z] - currentCenterFraction) <
          Math.abs(ZONE_CENTERS[best] - currentCenterFraction)
          ? z
          : best
      )
      targetZone = nearest
    }

    snapToZone(targetZone)
  }

  // ── Nav arrow handlers ───────────────────────────────────────────────────────
  const goLeft = () => {
    const idx = ZONE_ORDER.indexOf(activeZone)
    if (idx > 0) snapToZone(ZONE_ORDER[idx - 1])
  }
  const goRight = () => {
    const idx = ZONE_ORDER.indexOf(activeZone)
    if (idx < ZONE_ORDER.length - 1) snapToZone(ZONE_ORDER[idx + 1])
  }
  const goCenter = () => snapToZone('center')

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="room-map"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pannable stage */}
      <div
        ref={stageRef}
        className={`room-map__stage${isAnimating ? ' room-map__stage--animating' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        <Image
          className="room-map__image"
          src={isDark ? '/room-night.png' : '/room-day.png'}
          alt="Cozy pixel-art room"
          fill
          sizes="100vw"
          draggable={false}
          unoptimized
          priority
        />
        {HOTSPOTS.map((h) => (
          <MobileHotspot key={h.id} {...h} onTap={onHotspot} dragRef={drag} />
        ))}
      </div>

      {/* Zone nav arrows — fixed, outside stage */}
      <div className="room-map__nav">
        <button
          className="room-map__nav-btn"
          onClick={goLeft}
          disabled={activeZone === 'left'}
          aria-label="Pan to bookshelf"
        >
          ←
        </button>
        <button
          className="room-map__nav-btn room-map__nav-btn--center"
          onClick={goCenter}
          aria-label="Center view"
        >
          ●
        </button>
        <button
          className="room-map__nav-btn"
          onClick={goRight}
          disabled={activeZone === 'right'}
          aria-label="Pan to collection"
        >
          →
        </button>
      </div>

      {/* Minimap — fixed, outside stage */}
      <MobileMapMinimap offset={offset} isDark={isDark} stageWidth={stageWidth} />
    </div>
  )
}
