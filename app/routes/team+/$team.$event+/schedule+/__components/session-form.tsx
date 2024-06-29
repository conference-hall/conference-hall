import { Form } from '@remix-run/react';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';

import type { Session, Track } from './schedule/types.ts';
import { formatTimeSlot } from './schedule/utils/timeslots.ts';

type SessionFormModalProps = {
  session: Session | null;
  tracks: Array<Track>;
  onClose: () => void;
};

export function SessionFormModal({ session, tracks, onClose }: SessionFormModalProps) {
  const open = Boolean(session);
  const sessionTrack = session ? tracks.find((t) => session.trackId === t.id)?.name : 'Unknown';
  const sessionTimeslot = session ? formatTimeSlot(session.timeslot) : '00:00 - 00:00';

  return (
    <Modal title={`${sessionTrack}  -  ${sessionTimeslot}`} open={open} size="l" onClose={onClose}>
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
