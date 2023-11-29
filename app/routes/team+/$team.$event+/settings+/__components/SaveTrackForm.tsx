import { PencilIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { TextArea } from '~/design-system/forms/TextArea.tsx';
import { IconButton } from '~/design-system/IconButtons.tsx';
import { Modal } from '~/design-system/Modals.tsx';

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
        icon={PencilIcon}
        onClick={() => setModalOpen(true)}
        size="s"
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

type SaveTrackFormModalProps = { type: TrackType; initialValues?: TrackData; isOpen: boolean; onClose: () => void };

function SaveTrackFormModal({ type, initialValues, isOpen, onClose }: SaveTrackFormModalProps) {
  return (
    <Modal open={isOpen} size="l" onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Title>{type === 'formats' ? 'Format track' : 'Category track'}</Modal.Title>
        <Modal.Subtitle>Provide a name and description.</Modal.Subtitle>
        <Modal.Content className="space-y-4">
          <Input name="name" label="Name" defaultValue={initialValues?.name} required />
          <TextArea name="description" label="Description" defaultValue={initialValues?.description || ''} rows={4} />
        </Modal.Content>
        <Modal.Actions>
          <input type="hidden" name="_action" value={`save-${type}`} />
          <input type="hidden" name="id" value={initialValues?.id} />
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">{type === 'formats' ? 'Save format' : 'Save category'}</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
