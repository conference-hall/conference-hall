import { PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import slugify from '@sindresorhus/slugify';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Modal } from '~/shared/design-system/dialogs/modals.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Text } from '~/shared/design-system/typography.tsx';

type TracksModalProps = {
  initialValues: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: VoidFunction;
};

export function TracksModal({ initialValues, open, onClose }: TracksModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [tracks, setTracks] = useState(initialValues);
  const [newTrackLabel, setNewTrackLabel] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (index: number, value: string) => {
    const newOptions = [...tracks];
    newOptions[index] = { ...tracks[index], name: value };
    setTracks(newOptions);
  };

  const handleRemove = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!newTrackLabel) return;
    setTracks([...tracks, { id: `NEW-${slugify(newTrackLabel)}`, name: newTrackLabel }]);
    setNewTrackLabel('');
    newInputRef.current?.focus();
  };

  return (
    <Modal title={t('event-management.schedule.tracks.heading')} size="l" open={open} onClose={onClose}>
      <Modal.Content className="space-y-4">
        <Text>{t('event-management.schedule.tracks.description')}</Text>

        <Form id={formId} method="POST" onSubmit={onClose} className="space-y-4">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex gap-2">
              <input type="hidden" name={`tracks[${index}].id`} value={track.id} />
              <Input
                name={`tracks[${index}].name`}
                aria-label={t('event-management.schedule.tracks.edit-label', { name: index + 1 })}
                defaultValue={track.name}
                className="w-full"
                onChange={(event) => handleUpdate(index, event.target.value)}
                required
              />
              <Button
                type="button"
                aria-label={t('event-management.schedule.tracks.remove-label', { name: track.name })}
                variant="important"
                size="square-m"
                onClick={() => handleRemove(index)}
                disabled={tracks.length === 1}
              >
                <TrashIcon className="size-5" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </Form>

        <div className="flex gap-2">
          <Input
            ref={newInputRef}
            aria-label={t('event-management.schedule.tracks.new')}
            placeholder={t('event-management.schedule.tracks.new')}
            value={newTrackLabel}
            onChange={(event) => setNewTrackLabel(event.target.value)}
            onKeyUp={(event) => event.key === 'Enter' && handleAdd()}
            className="w-full"
            data-autofocus
          />
          <Button
            type="button"
            variant="secondary"
            aria-label={t('event-management.schedule.tracks.add')}
            disabled={!newTrackLabel}
            size="square-m"
            onClick={handleAdd}
          >
            <PlusIcon className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </Modal.Content>

      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="save-tracks" form={formId}>
          {t('common.save')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
