---
name: collection-no-page-scroll
description: Collection Kanban board must fit the viewport with no page-level vertical scroll, especially on phones
metadata:
  type: feedback
---

The `/collection` Kanban board should NOT cause page-level vertical scrolling on phones or smaller devices. The page fills the viewport (`h-[100dvh]` + `overflow-hidden` on the KanbanBoard root); only each column's card list scrolls internally.

**Why:** The user explicitly rejected page vertical scroll on mobile. An earlier attempt that let columns grow naturally (page scrolls) was reverted.

**How to apply:** Keep the board area as a `flex-1 min-h-0` region that fills leftover height after the header/toolbar; columns stretch to full height and the card drop zone is `flex-1 min-h-0 overflow-y-auto`. Horizontal scroll between columns is fine. The top nav (`.room-signout-group`) is `position: fixed`, so it takes no flow height.
