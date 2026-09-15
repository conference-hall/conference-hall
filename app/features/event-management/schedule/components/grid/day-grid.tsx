import { memo, type PointerEvent, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { type DayGrid, dateOfSlot, SLOTS_PER_HOUR, slotAtY } from '../../models/day-grid.ts';
import { useGestureStore } from '../../store/gesture-store.ts';
import { useColumnIds } from '../../store/schedule-store.ts';
import { GridGhost } from './grid-ghost.tsx';
import { gridArea, type GridOrigin, SessionItem } from './session-item.tsx';
import { TrackColumn } from './track-column.tsx';

type DayGridProps = { grid: DayGrid; gutter: boolean; multipleDays: boolean };

const HEADER_TOP = '4rem';
const GUTTER_WIDTH = '3rem';

export const Day = memo(function Day({ grid, gutter, multipleDays }: DayGridProps) {
  const { scheduleTime } = useScheduleContext();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const firstSlotRow = multipleDays ? 4 : 3;
  const origin = useMemo<GridOrigin>(() => ({ gutter, firstSlotRow }), [gutter, firstSlotRow]);
  const { hoverRef, onPointerMove, onPointerLeave } = useFreeSlotHover(grid, origin);

  const gutterCols = gutter ? 1 : 0;
  const trackHeaderRow = multipleDays ? 2 : 1;
  const trackHeaderTop = multipleDays ? `calc(${HEADER_TOP} + 2rem)` : HEADER_TOP;
  const hours = Array.from({ length: grid.hourCount }, (_, hour) => hour);

  return (
    <div
      data-day={grid.dayKey}
      className="grid w-full min-w-0 bg-white select-none"
      style={{
        gridTemplateColumns: `${gutter ? `${GUTTER_WIDTH} ` : ''}repeat(${grid.tracks.length}, minmax(0, 1fr))`,
        gridTemplateRows: multipleDays ? '2rem 2rem 1.5rem' : '3rem 1.5rem',
        gridAutoRows: 'var(--slot-height)',
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* day header */}
      {multipleDays && gutter && (
        <div className="sticky z-30 border-b bg-white" style={{ top: HEADER_TOP, gridColumn: 1, gridRow: 1 }} />
      )}
      {multipleDays && (
        <div
          className="sticky z-30 border-b bg-white text-center text-sm leading-8 font-semibold"
          style={{ top: HEADER_TOP, gridColumn: `${gutterCols + 1} / -1`, gridRow: 1 }}
        >
          {scheduleTime.formatDate(grid.day, locale)}
        </div>
      )}

      {/* tracks header */}
      {gutter && (
        <div
          className="sticky z-30 flex items-center justify-center border-b bg-white text-xs text-gray-400"
          style={{ top: trackHeaderTop, gridColumn: 1, gridRow: trackHeaderRow }}
        >
          {scheduleTime.gmtOffset(grid.day, locale)}
        </div>
      )}
      {grid.tracks.map((track, index) => (
        <div
          key={track.id}
          className="sticky z-30 flex items-center border-b border-l bg-white px-2 text-sm font-semibold text-gray-900 shadow-sm"
          style={{ top: trackHeaderTop, gridColumn: gutterCols + index + 1, gridRow: trackHeaderRow }}
        >
          <div className="w-full truncate text-center" title={track.name}>
            {track.name}
          </div>
        </div>
      ))}

      {/* empty line */}
      {grid.tracks.map((track, index) => (
        <div
          key={track.id}
          className="border-l"
          style={{ gridColumn: gutterCols + index + 1, gridRow: firstSlotRow - 1 }}
          aria-hidden
        />
      ))}

      {/* hour labels, in the gutter of the first displayed day */}
      {gutter &&
        hours.map((hour) => (
          <div
            key={hour}
            className="relative text-xs whitespace-nowrap text-gray-500"
            style={{
              gridColumn: 1,
              gridRow: `${firstSlotRow + hour * SLOTS_PER_HOUR} / span ${Math.min(SLOTS_PER_HOUR, grid.slotCount - hour * SLOTS_PER_HOUR)}`,
            }}
          >
            <HourLabel grid={grid} hour={hour} />
          </div>
        ))}

      {/* track columns */}
      {grid.tracks.map((track, index) => (
        <TrackColumn
          key={track.id}
          grid={grid}
          track={track}
          colIndex={index}
          className="border-l"
          style={{ gridColumn: gutterCols + index + 1, gridRow: `${firstSlotRow} / span ${grid.slotCount}` }}
        />
      ))}

      {/* free-slot hover, moved by direct DOM mutation */}
      <div ref={hoverRef} className="pointer-events-none bg-gray-50" hidden />

      {/* hour lines */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="pointer-events-none z-10 h-0 self-start border-t"
          style={{ gridColumn: `${gutterCols + 1} / -1`, gridRow: firstSlotRow + hour * SLOTS_PER_HOUR }}
          aria-hidden
        />
      ))}

      {/* sessions */}
      {grid.tracks.map((track) => (
        <TrackSessions key={track.id} grid={grid} trackId={track.id} origin={origin} />
      ))}

      <GridGhost grid={grid} origin={origin} />
    </div>
  );
});

// TrackSessions : display sessions for a single track.
type TrackSessionsProps = { grid: DayGrid; trackId: string; origin: GridOrigin };

const TrackSessions = memo(function TrackSessions({ grid, trackId, origin }: TrackSessionsProps) {
  const ids = useColumnIds(grid.dayKey, trackId);
  return ids.map((id) => <SessionItem key={id} id={id} grid={grid} origin={origin} />);
});

// HourLabel: displays the time label for a given hour.
type HourLabelProps = { grid: DayGrid; hour: number };

function HourLabel({ grid, hour }: HourLabelProps) {
  const { i18n } = useTranslation();
  const { scheduleTime } = useScheduleContext();
  const time = scheduleTime.formatTime(dateOfSlot(grid, hour * SLOTS_PER_HOUR), i18n.language);
  return (
    <time className="absolute -top-2 right-2" dateTime={time}>
      {time}
    </time>
  );
}

// useFreeSlotHover: one element per day, placed by direct DOM mutation from a frame-throttled pointer move.
function useFreeSlotHover(grid: DayGrid, origin: GridOrigin) {
  const gestureStore = useGestureStore();
  const hoverRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const targetRef = useRef<{ col: number; slot: number } | null>(null);

  const hide = () => {
    targetRef.current = null;
    if (hoverRef.current) hoverRef.current.hidden = true;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureStore.get()) return hide();

    const column = (event.target as Element).closest<HTMLElement>('[data-column-index]');
    if (!column) return hide();

    const rect = column.getBoundingClientRect();
    targetRef.current = {
      col: Number(column.dataset.columnIndex),
      slot: slotAtY(grid, { top: rect.top, height: rect.height }, event.clientY),
    };

    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const target = targetRef.current;
      const element = hoverRef.current;
      if (!target || !element) return;
      element.hidden = false;
      Object.assign(element.style, gridArea(target.col, target.slot, 1, origin));
    });
  };

  return { hoverRef, onPointerMove, onPointerLeave: hide };
}
