import { PlusIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import slugify from '@sindresorhus/slugify';
import { useRef, useState } from 'react';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Text } from '~/design-system/typography';

type TracksModalProps = {
  initialValues: Array<{ id: string; name: string }>;
  open: boolean;
  onClose: VoidFunction;
};

export function TracksModal({ initialValues, open, onClose }: TracksModalProps) {
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
    <Modal title="Schedule tracks configuration" size="l" open={open} onClose={onClose}>
      <Modal.Content className="space-y-4">
        <Text>Manage your schedule tracks by adding, editing, or removing items such as rooms or themes.</Text>

        <Form id="save-tracks" method="POST" onSubmit={onClose} className="space-y-4">
          {tracks.map((track, index) => (
            <div key={track.id} className="flex gap-2">
              <input type="hidden" name={`tracks[${index}].id`} value={track.id} />
              <Input
                name={`tracks[${index}].name`}
                aria-label={`Track ${index + 1}`}
                defaultValue={track.name}
                className="w-full"
                onChange={(event) => handleUpdate(index, event.target.value)}
                required
              />
              <Button
                type="button"
                aria-label={`Remove track: ${track.name}`}
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
            aria-label="New track"
            placeholder="New track"
            value={newTrackLabel}
            onChange={(event) => setNewTrackLabel(event.target.value)}
            onKeyUp={(event) => event.key === 'Enter' && handleAdd()}
            className="w-full"
            data-autofocus
          />
          <Button
            type="button"
            variant="secondary"
            aria-label="Add track"
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
          Cancel
        </Button>
        <Button type="submit" name="intent" value="save-tracks" form="save-tracks">
          Save
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
