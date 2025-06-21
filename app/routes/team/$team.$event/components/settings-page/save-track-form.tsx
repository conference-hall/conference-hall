import { PlusIcon } from '@heroicons/react/20/solid';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';

type TrackType = 'formats' | 'categories';
type TrackData = { id: string; name: string; description?: string | null };
type NewTrackButtonProps = { type: TrackType };

export function NewTrackButton({ type }: NewTrackButtonProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button iconLeft={PlusIcon} onClick={() => setModalOpen(true)} size="s" variant="secondary">
        {type === 'formats'
          ? t('event-management.settings.tracks.formats.new')
          : t('event-management.settings.tracks.categories.new')}
      </Button>
      <SaveTrackFormModal type={type} isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

type EditTrackButtonProps = { type: TrackType; initialValues: TrackData };

export function EditTrackButton({ type, initialValues }: EditTrackButtonProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)} size="s" variant="secondary">
        {t('common.edit')}
      </Button>
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
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Modal
      title={
        type === 'formats'
          ? t('event-management.settings.tracks.formats.heading')
          : t('event-management.settings.tracks.categories.heading')
      }
      size="l"
      open={isOpen}
      onClose={onClose}
    >
      <Modal.Content>
        <Form id={formId} method="POST" onSubmit={onClose} className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={initialValues?.name} required />
          <TextArea
            name="description"
            label={t('common.description')}
            defaultValue={initialValues?.description || ''}
            required
            rows={4}
          />
          <input type="hidden" name="id" value={initialValues?.id} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value={`save-${type}`} form={formId}>
          {type === 'formats'
            ? t('event-management.settings.tracks.formats.save')
            : t('event-management.settings.tracks.categories.save')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
