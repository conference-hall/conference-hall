import { PlusIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { IconButton } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';

type Track = { id: string; name: string };

type TrackListProps = {
  tracks: Array<Track>;
};

export function TracksForm({ tracks }: TrackListProps) {
  return (
    <Card as="section">
      <Card.Title className="flex items-center justify-between">
        <div>
          <H2>Tracks</H2>
          <Subtitle>Define tracks of your schedule (ex: rooms...).</Subtitle>
        </div>
        <NewTrackButton />
      </Card.Title>

      <Card.Content>
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
          {tracks.map((track) => (
            <li key={track.id} className="flex items-center justify-between p-4">
              <div className="truncate">
                <Text weight="medium" truncate>
                  {track.name}
                </Text>
              </div>
              <div className="ml-4 flex flex-shrink-0 gap-2">
                <EditTrackButton initialValues={track} />
                <Form method="POST">
                  <input type="hidden" name="id" value={track.id} />
                  <IconButton
                    icon={TrashIcon}
                    variant="secondary"
                    name="intent"
                    value="delete-track"
                    label="Remove track"
                  />
                </Form>
              </div>
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card>
  );
}

export function NewTrackButton() {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button iconLeft={PlusIcon} onClick={() => setModalOpen(true)} variant="secondary">
        New track
      </Button>
      <TrackFormModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type EditTrackButtonProps = { initialValues: Track };

function EditTrackButton({ initialValues }: EditTrackButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <IconButton icon={PencilSquareIcon} onClick={() => setModalOpen(true)} variant="secondary" label="Edit track" />
      <TrackFormModal initialValues={initialValues} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type TrackFormModalProps = { initialValues?: Track; isOpen: boolean; onClose: () => void };

function TrackFormModal({ initialValues, isOpen, onClose }: TrackFormModalProps) {
  return (
    <Modal title="Schedule track" size="l" open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id="save-track-form" method="POST" onSubmit={onClose} className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={initialValues?.name} required />
          <input type="hidden" name="id" value={initialValues?.id} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" name="intent" value="save-track" form="save-track-form">
          Save track
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
