import { CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import type { CollisionDetector } from '@dnd-kit/collision';
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { Point, Rectangle } from '@dnd-kit/geometry';
import { DragDropProvider, PointerSensor, useDragDropMonitor, useDraggable, useDroppable } from '@dnd-kit/react';
import { cx } from 'class-variance-authority';
import { addMinutes } from 'date-fns';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime, toDateInput } from '~/libs/datetimes/datetimes.ts';
import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import {
  countIntervalsInTimeSlot,
  getDailyTimeSlots,
  haveSameStartDate,
  isAfterTimeSlot,
  isTimeSlotIncluded,
  moveTimeSlotStart,
} from '~/libs/datetimes/timeslots.ts';
import { getGMTOffset } from '~/libs/datetimes/timezone.ts';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import type { TimeSlotSelector } from './use-timeslot-selector.tsx';
import { useTimeslotSelector } from './use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 5; // minutes
const TIMESLOT_HEIGHTS = [4, 8, 16, 20, 24]; // px
const SESSIONS_GAP_PX = 1;

type ScheduleProps = {
  displayedDays: Array<Date>;
  displayedTimes: { start: number; end: number };
  timezone: string;
  interval?: number;
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (trackId: string, timeslot: TimeSlot) => Promise<void>;
  onUpdateSession: (session: ScheduleSession) => Promise<boolean>;
  onSwitchSessions: (source: ScheduleSession, target: ScheduleSession) => Promise<void>;
  onSelectSession: (session: ScheduleSession) => void;
  zoomLevel: number;
};

export default function Schedule({
  displayedDays,
  displayedTimes,
  timezone,
  tracks = [],
  sessions = [],
  renderSession,
  onAddSession,
  onUpdateSession,
  onSwitchSessions,
  onSelectSession,
  zoomLevel,
}: ScheduleProps) {
  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        const { operation, canceled } = event;
        const { source, target } = operation;

        if (canceled || !source || !target) return;

        const { action, session } = source.data || {};
        const { type } = target.data || {};

        if (action === 'resize-session' && type === 'timeslot') {
          const { timeslot: targetTimeslot } = target.data || {};
          const updatedSession = safeSessionResizeToTimeslot(session, targetTimeslot, sessions);
          await onUpdateSession(updatedSession);
        } else if (action === 'move-session' && type === 'timeslot') {
          const { trackId, timeslot: targetTimeslot } = target.data || {};
          const updatedSession = safeSessionMoveToTimeslot(session, trackId, targetTimeslot, sessions);
          await onUpdateSession(updatedSession);
        } else if (action === 'move-session' && type === 'session') {
          const { session: sessionTarget } = target.data || {};
          await onSwitchSessions(session, sessionTarget);
        }
      }}
      sensors={[PointerSensor.configure({ activationConstraints: { distance: { value: 8 } } })]}
      modifiers={[RestrictToWindow]}
    >
      <div className="flex divide-x-3">
        {displayedDays.map((day, index) => (
          <ScheduleDay
            key={toDateInput(day)}
            day={day}
            dayIndex={index}
            displayedTimes={displayedTimes}
            timezone={timezone}
            tracks={tracks}
            sessions={sessions}
            renderSession={renderSession}
            onAddSession={onAddSession}
            onSelectSession={onSelectSession}
            zoomLevel={zoomLevel}
            displayMultipleDays={displayedDays.length > 1}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}

type ScheduleDayProps = {
  day: Date;
  dayIndex: number;
  timezone: string;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onAddSession: (trackId: string, timeslot: TimeSlot) => Promise<void>;
  onSelectSession: (session: ScheduleSession) => void;
  zoomLevel: number;
  displayMultipleDays: boolean;
};

function ScheduleDay({
  day,
  dayIndex,
  timezone,
  displayedTimes,
  tracks,
  sessions,
  renderSession,
  onAddSession,
  onSelectSession,
  zoomLevel,
  displayMultipleDays,
}: ScheduleDayProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const startTime = addMinutes(day, displayedTimes.start);
  const endTime = addMinutes(day, displayedTimes.end);
  const hours = getDailyTimeSlots(startTime, endTime, HOUR_INTERVAL, true);
  const selector = useTimeslotSelector(sessions, onAddSession);

  return (
    <div className={cx('w-full bg-white', { 'select-none': selector.isSelecting })}>
      <table className="min-w-full border-separate border-spacing-0">
        {/* header */}
        <thead className="sticky top-[64px] bg-white z-30 shadow-sm">
          {displayMultipleDays && (
            <tr className="h-8">
              <th className="border-b text-sm font-semibold" colSpan={tracks.length + 1}>
                {formatDate(day, { format: 'long', locale })}
              </th>
            </tr>
          )}
          <tr className={cx('divide-x', { 'h-12': !displayMultipleDays, 'h-8': displayMultipleDays })}>
            {/* gutter */}
            {dayIndex === 0 && (
              <th className="w-12 text-xs font-normal text-center bg-white text-gray-400">
                {getGMTOffset(timezone, locale)}
              </th>
            )}
            {/* tracks header */}
            {tracks.map((track) => (
              <th key={track.id} className="text-sm font-semibold text-gray-900 truncate">
                {track.name}
              </th>
            ))}
          </tr>
        </thead>

        {/* content */}
        <tbody>
          {/* empty line */}
          <tr className="divide-x">
            {dayIndex === 0 && <td className="h-6 w-12" />}
            {tracks.map((track) => (
              <td key={track.id} className="h-6" />
            ))}
          </tr>

          {/* rows by hours */}
          {hours.map((hour) => {
            const startHour = formatTime(hour.start, { format: 'short', locale });
            const endHour = formatTime(hour.end, { format: 'short', locale });
            const hourSlots = getDailyTimeSlots(hour.start, hour.end, SLOT_INTERVAL);

            return (
              <tr key={`${startHour}-${endHour}`} className="divide-x">
                {/* gutter */}
                {dayIndex === 0 && (
                  <td className="relative whitespace-nowrap text-xs text-gray-500">
                    <time className="absolute -top-2 right-2" dateTime={startHour}>
                      {startHour}
                    </time>
                  </td>
                )}

                {/* rows by track */}
                {tracks.map((track) => (
                  <td key={track.id} className="p-0">
                    {hourSlots.map((timeslot, index) => {
                      const session = sessions.find(
                        (s) => s.trackId === track.id && isTimeSlotIncluded(timeslot, s.timeslot),
                      );

                      return (
                        <MemoizedTimeslot
                          key={formatTime(timeslot.start, { format: 'short', locale })}
                          trackId={track.id}
                          timeslot={timeslot}
                          session={session}
                          sessions={sessions}
                          selector={selector}
                          zoomLevel={zoomLevel}
                          isFirstTimeslot={index === 0}
                          onSelectSession={onSelectSession}
                          renderSession={renderSession}
                        />
                      );
                    })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// FIXME: It improves performance a lot, but it breaks the session creation with drag and drop (selector)
const MemoizedTimeslot = React.memo(Timeslot, (prevProps, nextProps) => {
  return (
    prevProps.trackId === nextProps.trackId &&
    prevProps.timeslot.start.getTime() === nextProps.timeslot.start.getTime() &&
    prevProps.timeslot.end.getTime() === nextProps.timeslot.end.getTime() &&
    prevProps.session === nextProps.session &&
    prevProps.zoomLevel === nextProps.zoomLevel
  );
});

type TimeslotProps = {
  trackId: string;
  timeslot: TimeSlot;
  session?: ScheduleSession;
  sessions: Array<ScheduleSession>;
  selector: TimeSlotSelector;
  zoomLevel: number;
  isFirstTimeslot: boolean;
  onSelectSession: (session: ScheduleSession) => void;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
};

function Timeslot({
  trackId,
  timeslot,
  session,
  sessions,
  selector,
  zoomLevel,
  isFirstTimeslot,
  onSelectSession,
  renderSession,
}: TimeslotProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  // selection attributes
  const isSelected = selector.isSelectedSlot(trackId, timeslot);
  const selectedSlot = selector.getSelectedSlot(trackId);

  // displayed session on first session timeslot
  const displayedSession = session && haveSameStartDate(timeslot, session.timeslot) ? session : undefined;

  // droppable timeslot
  const droppable = useDroppable({
    id: `${trackId}-${timeslot.start.toISOString()}`,
    data: { type: 'timeslot', trackId, timeslot },
    accept: (source) => {
      return !session || source.type !== 'move-session' || (session && session?.id === source.data.session?.id);
    },
    collisionDetector: topInsideDroppable,
  });

  return (
    <div
      ref={droppable.ref}
      role="button"
      tabIndex={0}
      aria-label={`Timeslot ${formatTime(timeslot.start, { format: 'short', locale })}`}
      onMouseDown={!session ? selector.onSelectStart(trackId, timeslot) : undefined}
      onMouseEnter={!session ? selector.onSelectHover(trackId, timeslot) : undefined}
      onMouseUp={selector.onSelect}
      style={{ height: `${getTimeslotHeight(zoomLevel)}px` }}
      className={cx('relative', {
        'z-10': !session,
        'bg-blue-200': droppable.isDropTarget,
        'hover:bg-gray-50': !session && !isSelected,
        "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:border-t":
          isFirstTimeslot && !droppable.isDropTarget,
      })}
    >
      {/* invisible span to have content for the table */}
      <span className="invisible">{`Timeslot ${formatTime(timeslot.start, { format: 'short', locale })}`}</span>
      {displayedSession ? (
        // displayed session block
        <SessionWrapper
          key={displayedSession.id}
          session={displayedSession}
          sessions={sessions}
          renderSession={renderSession}
          onClick={onSelectSession}
          interval={SLOT_INTERVAL}
          zoomLevel={zoomLevel}
        />
      ) : selectedSlot && haveSameStartDate(timeslot, selectedSlot) ? (
        // display pre-rendered on session creation
        <SessionWrapper
          session={{ id: 'selection', trackId, timeslot: selectedSlot, color: 'stone', emojis: [], language: null }}
          sessions={sessions}
          renderSession={renderSession}
          interval={SLOT_INTERVAL}
          zoomLevel={zoomLevel}
        />
      ) : null}
    </div>
  );
}

type SessionWrapperProps = {
  session: ScheduleSession;
  sessions: Array<ScheduleSession>;
  renderSession: (session: ScheduleSession, height: number) => ReactNode;
  onClick?: (session: ScheduleSession) => void;
  interval: number;
  zoomLevel: number;
};

function SessionWrapper({ session, sessions, renderSession, onClick, interval, zoomLevel }: SessionWrapperProps) {
  // Compute session height
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
  const defaultHeight = getTimeslotHeight(zoomLevel) * intervalsCount - SESSIONS_GAP_PX;
  const [height, setHeight] = useState(defaultHeight);

  // update height on session resize
  useDragDropMonitor({
    onDragMove: ({ operation }) => {
      if (!operation.target || !operation.source) return;
      if (operation.source.type !== 'resize-session') return;
      if (operation.source.data?.session?.id !== session.id) return;

      const { timeslot: targetSlot } = operation.target.data;
      const resizedSession = safeSessionResizeToTimeslot(session, targetSlot, sessions);
      const intervalsCount = countIntervalsInTimeSlot(resizedSession.timeslot, interval);
      setHeight(getTimeslotHeight(zoomLevel) * intervalsCount - SESSIONS_GAP_PX);
    },
  });

  // draggable to move session
  const movable = useDraggable({
    id: `move:${session.id}`,
    type: 'move-session',
    data: { session, action: 'move-session' },
  });

  // draggable to resize session
  const resizable = useDraggable({
    id: `resize:${session.id}`,
    type: 'resize-session',
    data: { session, action: 'resize-session' },
  });

  // droppable to switch sessions
  const droppable = useDroppable({
    id: `drop:${session.id}`,
    data: { type: 'session', session },
    disabled: movable.isDragging || resizable.isDragging,
    accept: ['move-session'],
    collisionDetector: topInsideDroppable,
  });

  return (
    <>
      {/* session position & handler */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        ref={movable.ref}
        className={cx('absolute z-20 overflow-hidden text-left', {
          'ring-1 ring-blue-600 rounded-md': droppable.isDropTarget,
          'shadow-lg': movable.isDragging,
          'cursor-pointer': !movable.isDragging && !resizable.isDragging,
          'cursor-grabbing': movable.isDragging && !resizable.isDragging,
          'cursor-ns-resize': !movable.isDragging && resizable.isDragging,
        })}
        onClick={() => (onClick ? onClick(session) : undefined)}
        style={{ top: '0px', left: '1px', right: '1px', zIndex: movable.isDragging ? '40' : undefined }}
      >
        <div ref={droppable.ref} style={{ height: `${height}px` }}>
          {renderSession(session, height)}
        </div>
      </div>

      {/* resize handler */}
      <div
        ref={resizable.ref}
        style={{ top: `${height}px` }}
        className="absolute -bottom-1 h-1 w-full cursor-ns-resize z-40"
      />
    </>
  );
}

// Get a single timeslot height
function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[0];
}

// Return a valid resized session according given target timeslot
function safeSessionResizeToTimeslot(
  session: ScheduleSession,
  targetTimeslot: TimeSlot,
  sessions: Array<ScheduleSession>,
) {
  const trackSessions = sessions
    .filter((s) => s.trackId === session.trackId && s.id !== session.id)
    .sort((a, b) => {
      if (isAfterTimeSlot(a.timeslot, b.timeslot)) return 1;
      return -1;
    });

  const sessionAfter = trackSessions.filter((s) => isAfterTimeSlot(s.timeslot, session.timeslot)).at(0);
  let { start, end } = session.timeslot;

  if (sessionAfter && targetTimeslot.end > sessionAfter.timeslot.start) {
    end = sessionAfter.timeslot.start; // end cannot be after the next session
  } else if (targetTimeslot.end <= start) {
    end = addMinutes(start, SLOT_INTERVAL); // end cannot be before the start
  } else {
    end = targetTimeslot.end;
  }
  return { ...session, timeslot: { start, end } };
}

// Return a valid moved session according given target trackId and timeslot
function safeSessionMoveToTimeslot(
  session: ScheduleSession,
  targetTrackId: string,
  targetTimeslot: TimeSlot,
  sessions: Array<ScheduleSession>,
) {
  const trackSessions = sessions
    .filter((s) => s.trackId === targetTrackId && s.id !== session.id)
    .sort((a, b) => {
      if (isAfterTimeSlot(a.timeslot, b.timeslot)) return 1;
      return -1;
    });

  let { start, end } = moveTimeSlotStart(session.timeslot, targetTimeslot.start);
  const sessionAfter = trackSessions.filter((s) => isAfterTimeSlot(s.timeslot, { start, end })).at(0);

  if (sessionAfter && end > sessionAfter.timeslot.start) {
    end = sessionAfter.timeslot.start; // end cannot be after the next session
  }
  return { ...session, trackId: targetTrackId, timeslot: { start, end } };
}

export const topInsideDroppable: CollisionDetector = (input) => {
  const { dragOperation, droppable } = input;
  const { shape } = dragOperation;

  if (!droppable.shape || !shape) {
    return null;
  }

  const draggableRect = Rectangle.from(shape.current.boundingRectangle);
  const droppableRect = Rectangle.from(droppable.shape.boundingRectangle);

  const topCenter = {
    x: (draggableRect.left + draggableRect.right) / 2,
    y: draggableRect.top,
  };

  const isTopInside =
    topCenter.x >= droppableRect.left &&
    topCenter.x <= droppableRect.right &&
    topCenter.y >= droppableRect.top &&
    topCenter.y <= droppableRect.bottom;

  const value = isTopInside
    ? 1
    : 1 /
      Point.distance(topCenter, {
        x: (droppableRect.left + droppableRect.right) / 2,
        y: droppableRect.top,
      });

  return {
    id: droppable.id,
    value,
    type: CollisionType.Collision,
    priority: CollisionPriority.Normal,
  };
};
