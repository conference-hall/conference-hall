import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

import Schedule from './schedule/schedule.tsx';
import type { Session, Track } from './schedule/types.ts';
import { formatTimeSlot } from './schedule/utils/timeslots.ts';

export default function EventSchedule() {
  const [tracks, setTrack] = useState<Array<Track>>([{ id: uuid(), name: 'Room' }]);
  const addTrack = () => setTrack((r) => [...r, { id: uuid(), name: 'Room' }]);

  const [openSession, setOpenSession] = useState<Session | null>(null);
  const onCloseSession = () => setOpenSession(null);

  return (
    <Card>
      <SessionFormModal session={openSession} onClose={onCloseSession} />

      <div className="flex flex-row gap-4">
        <Button onClick={addTrack}>Add room</Button>
      </div>

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
