import { memo } from 'react';
import { type DayGrid, dateOfSlot } from '../../models/day-grid.ts';
import { SessionMutations } from '../../models/session-mutation.ts';
import { useGesture } from '../../store/gesture-store.ts';
import { SessionBlock } from '../session/session-block.tsx';
import { gridArea, type GridOrigin } from './session-item.tsx';

// The one ghost of a displayed day: the drop highlight of a move, the ring over the Session a move would swap
// with, or the Session draft being drawn. A resize draws nothing here, the resized block grows itself. Re-renders
// once per pointer event that changes the target, and only in the targeted day.

type GridGhostProps = { grid: DayGrid; origin: GridOrigin };

const noop = () => {};

export const GridGhost = memo(function GridGhost({ grid, origin }: GridGhostProps) {
  const gesture = useGesture((current) => (current && current.dayKey === grid.dayKey ? current : null));
  if (!gesture) return null;

  const col = grid.tracks.findIndex((track) => track.id === gesture.trackId);
  if (col < 0) return null;

  switch (gesture.kind) {
    case 'move':
      return <div className="pointer-events-none z-10 bg-blue-200" style={gridArea(col, gesture.slot, 1, origin)} />;

    case 'swap':
      return (
        <div
          className="pointer-events-none z-30 mx-px rounded-md ring-1 ring-blue-600"
          style={gridArea(col, gesture.slot, gesture.span, origin)}
        />
      );

    case 'resize':
      return null;

    case 'draft': {
      const session = SessionMutations.blank({
        trackId: gesture.trackId,
        timeslot: { start: dateOfSlot(grid, gesture.slot), end: dateOfSlot(grid, gesture.endSlot) },
      });
      return (
        <div
          className="pointer-events-none z-20 mx-px"
          style={gridArea(col, gesture.slot, gesture.endSlot - gesture.slot, origin)}
        >
          <div className="session-frame">
            <SessionBlock session={session} onOpen={noop} />
          </div>
        </div>
      );
    }
  }
});
