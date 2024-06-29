import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import type { TimeSlot } from './utils/timeslots.ts';
import {
  countIntervalsInTimeSlot,
  extractTimeSlots,
  formatTime,
  formatTimeSlot,
  generateTimeSlots,
  totalTimeInMinutes,
} from './utils/timeslots.ts';
import type { Session } from './utils/use-sessions.tsx';
import { useSessions } from './utils/use-sessions.tsx';
import { useTimeslotSelector } from './utils/use-timeslot-selector.tsx';

const HOUR_INTERVAL = 60; // minutes
const SLOT_INTERVAL = 10; // minutes
const TIMESLOT_HEIGHT = 24; // px
const SESSION_MIN_HEIGHT = 24; // px

export default function Schedule() {
  const startTimeline = '09:00';
  const endTimeline = '18:00';
  const hours = generateTimeSlots(startTimeline, endTimeline, HOUR_INTERVAL);
  const slots = generateTimeSlots(startTimeline, endTimeline, SLOT_INTERVAL);

  const [tracks, setTrack] = useState(['', '', '']);
  const addTrack = () => setTrack((r) => [...r, '']);

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  const sessions = useSessions();

  const onAddSession = (track: number, timeslot: TimeSlot) => {
    sessions.addSession(track, timeslot);
    setOpenSession({ track, timeslot });
  };

  const selector = useTimeslotSelector(onAddSession);

  return (
    <Card>
      <SessionFormModal session={openSession} onClose={onCloseSession} />

      <div className="flex flex-row gap-4">
        <Button onClick={addTrack}>Add room</Button>
      </div>
      <div className="flow-root select-none">
        <div className="inline-block min-w-full">
          <table className="min-w-full border-separate border-spacing-0">
            {/* Gutter */}
            <thead>
              <tr className="divide-x divide-gray-200">
                <th
                  scope="col"
                  className="sticky top-0 z-40 bg-white w-6 border-b border-gray-300 text-left text-sm font-semibold text-gray-900"
                >
                  Time
                </th>
                {tracks.map((_, trackIndex) => (
                  <th
                    key={trackIndex}
                    scope="col"
                    className="sticky top-0 z-40 bg-white border-b border-gray-300 text-left text-sm font-semibold text-gray-900 table-cell"
                  >
                    Room
                  </th>
                ))}
              </tr>
            </thead>

            {/* Content */}
            <tbody>
              {/* Hours */}
              {hours.map((hour) => {
                const startTime = formatTime(hour.start);
                const endTime = formatTime(hour.end);
                const hourSlots = extractTimeSlots(slots, startTime, endTime);

                return (
                  <tr key={`${startTime}-${endTime}`} className="divide-x divide-gray-200 align-top">
                    {/* Gutter time */}
                    <td className="border-b border-gray-200 whitespace-nowrap text-sm font-medium text-gray-900 table-cell">
                      {startTime}
                    </td>

                    {/* Rows by track */}
                    {tracks.map((_, trackIndex) => (
                      <td key={trackIndex} className="border-b border-gray-200 table-cell">
                        {hourSlots.map((slot) => {
                          const startTime = formatTime(slot.start);
                          const endTime = formatTime(slot.end);
                          const isSelected = selector.isSelectedSlot(trackIndex, slot);
                          const selectable = !sessions.hasSession(trackIndex, slot);
                          const session = sessions.getSession(trackIndex, slot);

                          return (
                            <div
                              key={`${startTime}-${endTime}`}
                              onMouseDown={selectable ? selector.onSelectStart(trackIndex, slot) : undefined}
                              onMouseEnter={selectable ? selector.onSelectHover(trackIndex, slot) : undefined}
                              onMouseUp={selector.onSelect}
                              className={cx('relative', {
                                'hover:bg-gray-50 cursor-pointer': selectable && !isSelected,
                                'bg-blue-50 cursor-pointer': selectable && isSelected,
                              })}
                              style={{ height: `${TIMESLOT_HEIGHT}px` }}
                            >
                              {session ? <SessionBlock session={session} onOpenSession={setOpenSession} /> : null}
                            </div>
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
      </div>
    </Card>
  );
}

type SessionProps = {
  session: Session;
  onOpenSession: (session: Session) => void;
};

function SessionBlock({ session, onOpenSession }: SessionProps) {
  const totalTimeMinutes = totalTimeInMinutes(session.timeslot);
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, SLOT_INTERVAL);

  const height = Math.max(
    TIMESLOT_HEIGHT * intervalsCount + (Math.ceil(totalTimeMinutes / HOUR_INTERVAL) - 1) * 3,
    SESSION_MIN_HEIGHT,
  );

  return (
    <div
      className={cx(
        'absolute top-0 left-0 right-0 z-20 p-1 text-xs overflow-hidden bg-red-50 border border-red-200 rounded cursor-pointer',
        { 'flex flex-row gap-2': intervalsCount === 1 },
      )}
      style={{ height: `${height}px` }}
      onClick={() => onOpenSession(session)}
    >
      <p className="text-red-400 truncate">{formatTimeSlot(session.timeslot)}</p>
      <p className="text-red-400 font-semibold truncate">(No title)</p>
    </div>
  );
}

type SessionFormModalProps = { session: Session | null; onClose: () => void };

function SessionFormModal({ session, onClose }: SessionFormModalProps) {
  const open = Boolean(session);
  const title = session ? formatTimeSlot(session.timeslot) : null;

  return (
    <Modal title={title} open={open} size="l" onClose={onClose}>
      {session ? (
        <Form method="POST" onSubmit={onClose}>
          <Modal.Content>(No title)</Modal.Content>
          <Modal.Actions>
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" name="intent" value="save-session">
              Save
            </Button>
          </Modal.Actions>
        </Form>
      ) : null}
    </Modal>
  );
}
