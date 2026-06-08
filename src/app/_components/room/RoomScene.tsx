'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from '../ThemeContext'
import { RoomHotspot } from './RoomHotspot'
import { RoomDrawer } from './RoomDrawer'
import { RoomModal } from './RoomModal'
import { MobileRoomMap } from './MobileRoomMap'
import { RelaxOverlay } from './panels/RelaxOverlay'
import { StatsPanel } from './panels/StatsPanel'
import { CatPanel } from './panels/CatPanel'
import { CouchPanel } from './panels/CouchPanel'
import { DiscoverPanel } from './panels/DiscoverPanel'
import { NotebookPanel } from './panels/NotebookPanel'
import { TrashPanel } from './panels/TrashPanel'
import { AddBookPanel } from './panels/AddBookPanel'

type HotspotId =
  | 'bookshelf-left'
  | 'bookshelf-right'
  | 'statspaper'
  | 'cat'
  | 'couch'
  | 'globe'
  | 'notebook'
  | 'trash'
  | 'window';

type HotspotDef = {
  id: HotspotId;
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

const MODAL_HOTSPOTS = new Set<HotspotId>(['statspaper', 'cat', 'bookshelf-left'])
const DRAWER_HOTSPOTS = new Set<HotspotId>(['couch', 'globe', 'notebook', 'trash'])

const MODAL_TITLES: Record<string, string> = {
  statspaper: '📊 Reading Stats',
  cat: '🐱 Surprise Me',
  'bookshelf-left': '📚 Add Book',
}

const DRAWER_TITLES: Record<string, string> = {
  couch: '🛋️ Currently Reading',
  globe: '🔍 Discover Books',
  notebook: '📋 My Notes',
  trash: '🗑️ Dropped Books',
}

export const RoomScene = () => {
  const router = useRouter()
  const { isDark } = useTheme()
  const [activeDrawer, setActiveDrawer] = useState<HotspotId | null>(null)
  const [activeModal, setActiveModal] = useState<HotspotId | null>(null)
  const [relaxOpen, setRelaxOpen] = useState(false)
  const isMobile = useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(max-width: 767px)')
      mq.addEventListener('change', callback)
      return () => mq.removeEventListener('change', callback)
    },
    () => window.matchMedia('(max-width: 767px)').matches,
    () => false,
  )

  const roomBg = isDark ? '/room-night.png' : '/room-day.png'

  const handleHotspot = useCallback(
    (id: string) => {
      const hid = id as HotspotId
      if (hid === 'bookshelf-right') { router.push('/collection'); return }
      if (hid === 'window') { setRelaxOpen(true); return }
      if (MODAL_HOTSPOTS.has(hid)) { setActiveModal(hid); return }
      if (DRAWER_HOTSPOTS.has(hid)) { setActiveDrawer(hid); return }
    },
    [router],
  )

  // Shared overlays (used by both mobile and desktop)
  const sharedOverlays = (
    <>
      <RelaxOverlay open={relaxOpen} onClose={() => setRelaxOpen(false)} />
      <RoomModal
        open={activeModal !== null}
        title={MODAL_TITLES[activeModal ?? ''] ?? ''}
        onClose={() => setActiveModal(null)}
      >
        {activeModal === 'statspaper' && <StatsPanel />}
        {activeModal === 'cat' && <CatPanel />}
        {activeModal === 'bookshelf-left' && <AddBookPanel onClose={() => setActiveModal(null)} />}
      </RoomModal>
      <RoomDrawer
        open={activeDrawer !== null}
        title={DRAWER_TITLES[activeDrawer ?? ''] ?? ''}
        onClose={() => setActiveDrawer(null)}
      >
        {activeDrawer === 'couch' && <CouchPanel />}
        {activeDrawer === 'globe' && <DiscoverPanel />}
        {activeDrawer === 'notebook' && <NotebookPanel />}
        {activeDrawer === 'trash' && <TrashPanel />}
      </RoomDrawer>
    </>
  )

  // ─── Mobile view ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <MobileRoomMap
          isDark={isDark}
          onHotspot={handleHotspot}
        />
        {sharedOverlays}
      </>
    )
  }

  // ─── Desktop view ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="room-container">
        <div className="room-inner">
          <Image
            className="room-bg"
            src={roomBg}
            alt="Cozy pixel-art room"
            fill
            sizes="100vw"
            draggable={false}
            unoptimized
            priority
          />
          {HOTSPOTS.map((h) => (
            <RoomHotspot key={h.id} {...h} onClick={handleHotspot} />
          ))}
        </div>
      </div>
      {sharedOverlays}
    </>
  )
}
