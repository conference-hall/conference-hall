import { ArrowsPointingInIcon, ArrowsPointingOutIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { IconButton } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import Schedule from './schedule/schedule.tsx';
import type { Session, Track } from './schedule/types.ts';
import { formatTimeSlot } from './schedule/utils/timeslots.ts';

export default function EventSchedule() {
  const [expanded, setExpanded] = useState(false);

  const [tracks, setTrack] = useState<Array<Track>>([{ id: uuid(), name: 'Room' }]);
  const addTrack = () => setTrack((r) => [...r, { id: uuid(), name: 'Room' }]);

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <main className={cx('px-4 my-4', { 'mx-auto max-w-7xl': !expanded })}>
      <Card>
        <SessionFormModal session={openSession} onClose={onCloseSession} />

        <header className="flex flex-row items-center justify-between gap-4 p-4 px-6 rounded-t-lg bg-slate-100">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            <time dateTime="2022-01-01">January 1st 2022</time>
          </h1>
          <div className="flex items-center gap-4">
            {expanded ? (
              <IconButton
                icon={ArrowsPointingInIcon}
                label="Collapse schedule"
                onClick={() => setExpanded(false)}
                variant="secondary"
              />
            ) : (
              <IconButton
                icon={ArrowsPointingOutIcon}
                label="Expand schedule"
                onClick={() => setExpanded(true)}
                variant="secondary"
              />
            )}

            <IconButton icon={Cog6ToothIcon} label="Schedule settings" onClick={addTrack} variant="secondary" />
          </div>
        </header>

        <Schedule
          startTime="09:00"
          endTime="17:00"
          tracks={tracks}
          initialSessions={[]}
          onAddSession={setOpenSession}
          onSelectSession={setOpenSession}
          renderSession={(session, oneLine) => <SessionBlock session={session} oneLine={oneLine} />}
        />
      </Card>
    </main>
  );
}

type SessionBlockProps = { session: Session; oneLine: boolean };

function SessionBlock({ session, oneLine }: SessionBlockProps) {
  return (
    <div
      className={cx('text-xs flex gap-2 p-1 bg-red-50 border border-red-200 rounded h-full', { 'flex-row': oneLine })}
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
