"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { RoomHotspot } from "./RoomHotspot";
import { RoomDrawer } from "./RoomDrawer";
import { RoomModal } from "./RoomModal";
import { RoomSignOutButton } from "./RoomSignOutButton";
import { RelaxOverlay } from "./panels/RelaxOverlay";
import { StatsPanel } from "./panels/StatsPanel";
import { CatPanel } from "./panels/CatPanel";
import { CouchPanel } from "./panels/CouchPanel";
import { DiscoverPanel } from "./panels/DiscoverPanel";
import { NotebookPanel } from "./panels/NotebookPanel";
import { TrashPanel } from "./panels/TrashPanel";
import { AddBookPanel } from "./panels/AddBookPanel";

type HotspotId =
  | "bookshelf"
  | "bookshelf-right"
  | "statspaper"
  | "cat"
  | "couch"
  | "globe"
  | "notebook"
  | "trash"
  | "window";

type HotspotDef = {
  id: HotspotId;
  label: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const HOTSPOTS: HotspotDef[] = [
  { id: "bookshelf", label: "Add Book", top: 15, left: 9, width: 13.7, height: 38.5 },
  { id: "bookshelf-right", label: "Collection", top: 14, left: 79.3, width: 13.2, height: 49 },
  { id: "window", label: "Relax", top: 9, left: 30, width: 39.5, height: 41 },
  { id: "statspaper", label: "Stats", top: 34.2, left: 23, width: 1.6, height: 7.5 },
  { id: "cat", label: "Surprise", top: 80, left: 10, width: 19, height: 15.5 },
  { id: "couch", label: "Reading", top: 78, left: 40, width: 15, height: 15.5 },
  { id: "globe", label: "Discover", top: 1, left: 10.6, width: 9.25, height: 15 },
  { id: "notebook", label: "Notes", top: 52, left: 48, width: 10.5, height: 5 },
  { id: "trash", label: "Dropped", top: 71, left: 55, width: 4.8, height: 10 },
];

const MODAL_HOTSPOTS = new Set<HotspotId>(["statspaper", "cat", "bookshelf"]);
const DRAWER_HOTSPOTS = new Set<HotspotId>(["couch", "globe", "notebook", "trash"]);

const MODAL_TITLES: Record<string, string> = {
  statspaper: "📊 Reading Stats",
  cat: "🐱 Surprise Me",
  "bookshelf": "📚 Add Book",
};

const DRAWER_TITLES: Record<string, string> = {
  couch: "🛋️ Currently Reading",
  globe: "🔍 Discover Books",
  notebook: "📋 My Notes",
  trash: "🗑️ Dropped Books",
};

type MobileIcon = {
  emoji: string;
  label: string;
  action: HotspotId | "collection";
};

const MOBILE_ICONS: MobileIcon[] = [
  { emoji: "📚", label: "Collection", action: "collection" },
  { emoji: "➕", label: "Add Book", action: "bookshelf" },
  { emoji: "📊", label: "Stats", action: "statspaper" },
  { emoji: "🛋️", label: "Reading", action: "couch" },
  { emoji: "🐱", label: "Surprise", action: "cat" },
  { emoji: "🔍", label: "Discover", action: "globe" },
  { emoji: "📋", label: "Notes", action: "notebook" },
  { emoji: "🗑️", label: "Dropped", action: "trash" },
  { emoji: "🪟", label: "Relax", action: "window" },
];

type Props = { userName: string };

export const RoomScene = ({ userName }: Props) => {
  const router = useRouter();
  const [activeDrawer, setActiveDrawer] = useState<HotspotId | null>(null);
  const [activeModal, setActiveModal] = useState<HotspotId | null>(null);
  const [relaxOpen, setRelaxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount + resize
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleHotspot = useCallback(
    (id: string) => {
      const hid = id as HotspotId;
      if (hid === "bookshelf-right") { router.push("/collection"); return; }
      if (hid === "window") { setRelaxOpen(true); return; }
      if (MODAL_HOTSPOTS.has(hid)) { setActiveModal(hid); return; }
      if (DRAWER_HOTSPOTS.has(hid)) { setActiveDrawer(hid); return; }
    },
    [router],
  );

  const handleMobileIcon = useCallback(
    (action: string) => {
      if (action === "collection") { router.push("/collection"); return; }
      handleHotspot(action);
    },
    [router, handleHotspot],
  );

  // ─── Mobile view ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <div className="room-mobile">
          <img
            className="room-mobile__bg"
            src="/room-day.png"
            alt=""
            draggable={false}
          />
          <div className="room-mobile__overlay">
            {/* Sign out */}
            <button
              className="room-mobile__signout"
              onClick={() => signOut()}
            >
              <span>{userName || "Sign out"}</span>
              <span aria-hidden>⏻</span>
            </button>

            <p className="room-mobile__title">Bookroom</p>

            <div className="room-mobile__grid">
              {MOBILE_ICONS.map(({ emoji, label, action }) => (
                <button
                  key={action}
                  className="room-mobile__icon"
                  onClick={() => handleMobileIcon(action)}
                >
                  <span className="room-mobile__icon-emoji">{emoji}</span>
                  <span className="room-mobile__icon-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shared overlays — same as desktop */}
        <RelaxOverlay open={relaxOpen} onClose={() => setRelaxOpen(false)} />
        <RoomModal
          open={activeModal !== null}
          title={MODAL_TITLES[activeModal ?? ""] ?? ""}
          onClose={() => setActiveModal(null)}
        >
          {activeModal === "statspaper" && <StatsPanel />}
          {activeModal === "cat" && <CatPanel />}
          {activeModal === "bookshelf" && <AddBookPanel onClose={() => setActiveModal(null)} />}
        </RoomModal>
        <RoomDrawer
          open={activeDrawer !== null}
          title={DRAWER_TITLES[activeDrawer ?? ""] ?? ""}
          onClose={() => setActiveDrawer(null)}
        >
          {activeDrawer === "couch" && <CouchPanel />}
          {activeDrawer === "globe" && <DiscoverPanel />}
          {activeDrawer === "notebook" && <NotebookPanel />}
          {activeDrawer === "trash" && <TrashPanel />}
        </RoomDrawer>
      </>
    );
  }

  // ─── Desktop view ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="room-container">
        <div className="room-inner">
          <img
            className="room-bg"
            src="/room-day.png"
            alt="Cozy pixel-art room"
            draggable={false}
          />
          {HOTSPOTS.map((h) => (
            <RoomHotspot key={h.id} {...h} onClick={handleHotspot} />
          ))}
        </div>
        <RoomSignOutButton userName={userName} />
      </div>

      <RelaxOverlay open={relaxOpen} onClose={() => setRelaxOpen(false)} />

      <RoomModal
        open={activeModal !== null}
        title={MODAL_TITLES[activeModal ?? ""] ?? ""}
        onClose={() => setActiveModal(null)}
      >
        {activeModal === "statspaper" && <StatsPanel />}
        {activeModal === "cat" && <CatPanel />}
        {activeModal === "bookshelf" && <AddBookPanel onClose={() => setActiveModal(null)} />}
      </RoomModal>

      <RoomDrawer
        open={activeDrawer !== null}
        title={DRAWER_TITLES[activeDrawer ?? ""] ?? ""}
        onClose={() => setActiveDrawer(null)}
      >
        {activeDrawer === "couch" && <CouchPanel />}
        {activeDrawer === "globe" && <DiscoverPanel />}
        {activeDrawer === "notebook" && <NotebookPanel />}
        {activeDrawer === "trash" && <TrashPanel />}
      </RoomDrawer>
    </>
  );
};
