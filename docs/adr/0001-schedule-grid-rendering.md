---
status: accepted
---

# Schedule grid rendered as a CSS grid with one drop target per Track column

The organizer schedule renders one `<table>` per displayed day with a `div` per 5-minute slot, each slot a dnd-kit droppable: on a 3-day, 8-track, 14-hour schedule that is 11 600 elements and 4 320 droppables, and dnd-kit pays for every one of them at drag start (0.6 to 0.9 s freeze) and on every pointer move (~50 ms). The rewritten client renders each day as a CSS grid with one row per 5-minute slot and no element per slot: a Session block is a grid item spanning its slots, the hour lines and gutter labels are grid items too, and each Track column is a single dnd-kit droppable. The drop target of a move or a resize is the column under the dragged block plus the minute derived from the block's top edge inside it; a move onto an occupied slot is a swap, decided by the Sessions model, not by a droppable per Session. Live feedback (drop highlight, swap ring, resize preview, Session draft) is app-rendered through one ghost element per day fed by a gesture store, since dnd-kit only moves a fixed-size clone.

Measured on the same seed with the same script (prod build, 3 days), this brought the grid to 2 600 elements, drag start to ~50 ms with no other long task during a drag, one rendered fiber per pointer event, 6 to 9 fibers per route re-render after a drop, hydration from 1.4 s to 0.3 s and the heap from 50 MB to 11 MB.

## Considered options

- **Absolute positioning inside one relative column per Track**: identical numbers on every threshold (the two share everything but the block placement). Rejected by the agreed default: the grid keeps the hour gutter, the hour lines and the sticky per-cell headers aligned by construction, tolerates 3 days in a row without a `min-width` fix, and can change the zoom by resizing its rows.
- **Keeping per-slot droppables with more memoization**: rejected by measurement; React was already not the cost during a drag, the DOM and dnd-kit were.
- **Canvas or SVG rendering**: out of scope, the look is frozen and the blocks stay DOM.

## Consequences

- Sizing of a Session block is CSS-driven: the slot height is one `--slot-height` custom property on the grid root, the day grids use `grid-auto-rows: var(--slot-height)`, and `SessionBlock` picks its size classes with height container queries on the block, so a zoom change renders one fiber instead of every block.
- The "Timeslot HH:MM" buttons no longer exist; the accessibility contract is the Session block, the Track column label and the header controls.
- A drop above the first slot or below the last one clamps to that slot instead of being ignored (kept by the gesture contract); a resize resolves in its own Track column only.
- Prototype and measurements: branch `research/grid-prototype`, wayfinder ticket 06 of the schedule rewrite map; spec `.scratch/schedule-rewrite/spec.md`.
