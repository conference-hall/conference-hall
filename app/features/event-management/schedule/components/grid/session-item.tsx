import { Feedback } from '@dnd-kit/dom';
import { useDraggable } from '@dnd-kit/react';
import { LockClosedIcon } from '@heroicons/react/16/solid';
import { cx } from 'class-variance-authority';
import { type CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleContext } from '../../context/schedule-context.tsx';
import { blockOf, type DayGrid } from '../../models/day-grid.ts';
import { useGesture } from '../../store/gesture-store.ts';
import { useSession } from '../../store/schedule-store.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionBlock } from '../session/session-block.tsx';
import { DRAG_SOURCES, type SessionPayload } from './dnd.ts';

export type GridOrigin = { gutter: boolean; firstSlotRow: number };

export function gridArea(col: number, slot: number, span: number, origin: GridOrigin): CSSProperties {
  return {
    gridColumn: String(col + (origin.gutter ? 2 : 1)),
    gridRow: `${origin.firstSlotRow + slot} / span ${span}`,
  };
}

type SessionItemProps = { id: string; grid: DayGrid; origin: GridOrigin };

export const SessionItem = memo(function SessionItem({ id, grid, origin }: SessionItemProps) {
  const session = useSession(id);
  const resizeEnd = useGesture((gesture) =>
    gesture?.kind === 'resize' && gesture.sessionId === id ? gesture.endSlot : null,
  );
  const { t } = useTranslation();
  const { onOpenSession, setSessionLock } = useScheduleContext();

  const disabled = !session || Boolean(session.isCreating);
  const payload = { session: session as ScheduleSession } satisfies SessionPayload;

  const { ref: moveRef, isDragging } = useDraggable({
    id: `move:${id}`,
    type: DRAG_SOURCES.move,
    data: payload,
    disabled,
    plugins: [Feedback.configure({ feedback: 'move', dropAnimation: null })],
  });

  const { ref: resizeRef } = useDraggable({
    id: `resize:${id}`,
    type: DRAG_SOURCES.resize,
    data: payload,
    disabled,
    plugins: [Feedback.configure({ feedback: 'move', dropAnimation: null })],
  });

  if (!session) return null;

  const block = blockOf(grid, session);
  const col = grid.tracks.findIndex((track) => track.id === session.trackId);
  if (!block || col < 0) return null;

  const span = resizeEnd === null ? block.span : Math.max(1, resizeEnd - block.slot);

  return (
    <div
      data-session={id}
      className="relative mx-px"
      style={{ ...gridArea(col, block.slot, span, origin), zIndex: isDragging ? 40 : 20 }}
    >
      <div className="session-frame overflow-hidden">
        <SessionBlock
          ref={moveRef}
          session={session}
          onOpen={() => onOpenSession({ mode: 'edit', session })}
          className={cx({ 'shadow-lg': isDragging })}
        />
      </div>

      {session.locked ? (
        <button
          type="button"
          aria-label={t('event-management.schedule.edit-session.unlock')}
          title={t('event-management.schedule.edit-session.unlock')}
          onClick={() => setSessionLock(session, false)}
          className="absolute top-0.5 right-0.5 z-10 cursor-pointer rounded-full bg-white/80 p-px opacity-90 hover:opacity-100"
        >
          <LockClosedIcon className="size-3" aria-hidden="true" />
        </button>
      ) : null}

      {/* resize handle, on the bottom edge of the block */}
      <div
        ref={resizeRef}
        aria-hidden="true"
        tabIndex={-1}
        className={cx('absolute z-40 h-1 w-full', { 'cursor-ns-resize': !session.locked })}
        style={{ top: 'calc(100% - 1px)' }}
      />
    </div>
  );
});
