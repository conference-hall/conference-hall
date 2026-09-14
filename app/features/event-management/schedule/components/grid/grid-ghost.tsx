import { memo } from 'react';
import { type DayGrid, dateOfSlot } from '../../models/day-grid.ts';
import { SessionMutations } from '../../models/session-mutation.ts';
import { useGesture } from '../../store/gesture-store.ts';
import { SessionBlock } from '../session/session-block.tsx';
import { type DayPlacement, gridPlacement } from './session-item.tsx';

// The one ghost of a displayed day: the drop highlight of a move, the ring over the Session a move would swap
// with, or the Session draft being drawn. A resize draws nothing here, the resized block grows itself. Re-renders
// once per pointer event that changes the target, and only in the targeted day.

type GridGhostProps = { grid: DayGrid; placement: DayPlacement };

const noop = () => {};

export const GridGhost = memo(function GridGhost({ grid, placement }: GridGhostProps) {
  const gesture = useGesture((current) => (current && current.dayKey === grid.dayKey ? current : null));
  if (!gesture) return null;

  const col = grid.tracks.findIndex((track) => track.id === gesture.trackId);
  if (col < 0) return null;

  switch (gesture.kind) {
    case 'move':
      return (
        <div
          data-ghost="move"
          className="pointer-events-none z-10 bg-blue-200"
          style={gridPlacement(col, gesture.slot, 1, placement)}
        />
      );

    case 'swap':
      return (
        <div
          data-ghost="swap"
          className="pointer-events-none z-30 rounded-md ring-1 ring-blue-600"
          style={{
            ...gridPlacement(col, gesture.slot, gesture.span, placement),
            marginLeft: '1px',
            marginRight: '1px',
          }}
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
          data-ghost="draft"
          className="pointer-events-none z-20"
          style={{
            ...gridPlacement(col, gesture.slot, gesture.endSlot - gesture.slot, placement),
            marginLeft: '1px',
            marginRight: '1px',
          }}
        >
          <div style={{ height: 'calc(100% - 1px)', containerName: 'session', containerType: 'size' }}>
            <SessionBlock session={session} onOpen={noop} />
          </div>
        </div>
      );
    }
  }
});
