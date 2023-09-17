import { TrashIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';

import { IconButton } from '~/design-system/IconButtons.tsx';
import { Subtitle, Text } from '~/design-system/Typography.tsx';

import { EditTrackButton } from './SaveTrackForm.tsx';

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

export function TrackList({ type, tracks }: TrackListProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {tracks.map((track) => (
        <li key={track.id} className="flex items-center justify-between p-4">
          <div className="truncate">
            <Text strong truncate>
              {track.name}
            </Text>
            <Subtitle truncate>{track.description}</Subtitle>
          </div>
          <div className="ml-4 flex flex-shrink-0 gap-2">
            <EditTrackButton type={type} initialValues={track} />
            <Form method="POST">
              <input type="hidden" name="_action" value={`delete-${type}`} />
              <input type="hidden" name="trackId" value={track.id} />
              <IconButton icon={TrashIcon} size="s" variant="secondary" label={`Remove ${track.name}`} />
            </Form>
          </div>
        </li>
      ))}
    </ul>
  );
}
