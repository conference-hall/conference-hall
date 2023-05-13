import { ExclamationTriangleIcon, PencilIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons';
import { Modal } from '~/design-system/dialogs/Modals';
import { Input } from '~/design-system/forms/Input';
import { TextArea } from '~/design-system/forms/TextArea';
import { IconButton } from '~/design-system/IconButtons';

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
        size="xs"
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
    <Modal open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Title
          title={type === 'formats' ? 'Format track' : 'Category track'}
          description="Provide a name and description."
          icon={ExclamationTriangleIcon}
          iconColor="info"
        />
        <div className="space-y-4">
          <input type="hidden" name="_action" value={`save-${type}`} />
          <input type="hidden" name="id" value={initialValues?.id} />
          <Input name="name" label="Name" defaultValue={initialValues?.name} required />
          <TextArea name="description" label="Description" defaultValue={initialValues?.description || ''} rows={4} />
        </div>
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">{type === 'formats' ? 'Save format' : 'Save category'}</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
