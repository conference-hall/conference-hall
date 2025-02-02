import { PlusIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';
import { IconButton } from '~/design-system/icon-buttons.tsx';

type TrackType = 'formats' | 'categories';
type TrackData = { id: string; name: string; description?: string | null };
type NewTrackButtonProps = { type: TrackType };

export function NewTrackButton({ type }: NewTrackButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button iconLeft={PlusIcon} onClick={() => setModalOpen(true)} variant="secondary">
        {type === 'formats' ? 'New format' : 'New category'}
      </Button>
      <SaveTrackFormModal type={type} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type EditTrackButtonProps = { type: TrackType; initialValues: TrackData };

export function EditTrackButton({ type, initialValues }: EditTrackButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <IconButton
        icon={PencilSquareIcon}
        onClick={() => setModalOpen(true)}
        variant="secondary"
        label={`Edit ${initialValues.name}`}
      />
      <SaveTrackFormModal
        type={type}
        initialValues={initialValues}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type SaveTrackFormModalProps = { type: TrackType; initialValues?: TrackData; isOpen: boolean; onClose: VoidFunction };

function SaveTrackFormModal({ type, initialValues, isOpen, onClose }: SaveTrackFormModalProps) {
  return (
    <Modal title={type === 'formats' ? 'Format track' : 'Category track'} size="l" open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id="save-track-form" method="POST" onSubmit={onClose} className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={initialValues?.name} required />
          <TextArea
            name="description"
            label="Description"
            defaultValue={initialValues?.description || ''}
            required
            rows={4}
          />
          <input type="hidden" name="id" value={initialValues?.id} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" name="intent" value={`save-${type}`} form="save-track-form">
          {type === 'formats' ? 'Save format' : 'Save category'}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
