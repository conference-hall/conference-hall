import { TrashIcon } from '@heroicons/react/24/outline';
import { Form } from 'react-router';

import { IconButton } from '~/design-system/icon-buttons.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';

import { EditTrackButton } from './save-track-form.tsx';

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

export function TrackList({ type, tracks }: TrackListProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200" aria-label={`${type} list`}>
      {tracks.map((track) => (
        <li key={track.id} className="flex items-center justify-between p-4">
          <div className="truncate">
            <Text weight="medium" truncate>
              {track.name}
            </Text>
            <Subtitle truncate>{track.description}</Subtitle>
          </div>
          <div className="ml-4 flex flex-shrink-0 gap-2">
            <EditTrackButton type={type} initialValues={track} />
            <Form method="POST">
              <input type="hidden" name="trackId" value={track.id} />
              <IconButton
                icon={TrashIcon}
                variant="secondary"
                name="intent"
                value={`delete-${type}`}
                label={`Remove ${track.name}`}
              />
            </Form>
          </div>
        </li>
      ))}
    </ul>
  );
}
