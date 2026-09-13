import { PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Text } from '~/design-system/typography.tsx';

type TracksModalProps = {
  initialValues: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: VoidFunction;
};

// A row key is local to the modal and never sent: a new row has no Track id, an existing one carries its own.
type TrackRow = { key: string; id?: string; name: string };

export function TracksModal({ initialValues, open, onClose }: TracksModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [tracks, setTracks] = useState<Array<TrackRow>>(() =>
    initialValues.map((track) => ({ key: track.id, id: track.id, name: track.name })),
  );
  const [newTrackLabel, setNewTrackLabel] = useState('');
  const newInputRef = useRef<HTMLInputElement>(null);

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';
  const error = fetcher.data?.errors?.tracks;

  // The modal only closes once the server has answered without refusing the save.
  useEffect(() => {
    if (isSubmitting || fetcher.data === undefined || error) return;
    onClose();
  }, [isSubmitting, fetcher.data, error, onClose]);

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
    setTracks([...tracks, { key: crypto.randomUUID(), name: newTrackLabel }]);
    setNewTrackLabel('');
    newInputRef.current?.focus();
  };

  return (
    <Modal title={t('event-management.schedule.tracks.heading')} size="l" open={open} onClose={onClose}>
      <Modal.Content className="space-y-4">
        <Text>{t('event-management.schedule.tracks.description')}</Text>

        <fetcher.Form id={formId} method="POST" className="space-y-4">
          {tracks.map((track, index) => (
            <div key={track.key} className="flex gap-2">
              {track.id ? <input type="hidden" name={`tracks[${index}].id`} value={track.id} /> : null}
              <Input
                name={`tracks[${index}].name`}
                aria-label={t('event-management.schedule.tracks.edit-label', { name: index + 1 })}
                value={track.name}
                className="w-full"
                onChange={(event) => handleUpdate(index, event.target.value)}
                required
              />
              <Button
                type="button"
                icon={TrashIcon}
                label={t('event-management.schedule.tracks.remove-label', { name: track.name })}
                variant="important"
                onClick={() => handleRemove(index)}
              />
            </div>
          ))}
        </fetcher.Form>

        {error ? <Callout variant="error">{error}</Callout> : null}

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
            icon={PlusIcon}
            label={t('event-management.schedule.tracks.add')}
            variant="secondary"
            disabled={!newTrackLabel}
            onClick={handleAdd}
          />
        </div>
      </Modal.Content>

      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="save-tracks" form={formId} disabled={isSubmitting}>
          {t('common.save')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
