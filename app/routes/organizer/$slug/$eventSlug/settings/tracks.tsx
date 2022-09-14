import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { PlusIcon } from '@heroicons/react/20/solid';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { useOutletContext } from '@remix-run/react';
import type { OrganizerEventContext } from '../../$eventSlug';
import { IconButton } from '~/design-system/IconButtons';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventTracksSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Formats</H2>
        <Checkbox
          id="formatsRequired"
          name="formatsRequired"
          description="When a speaker submit a proposal, the format selection is mandatory."
          className="mt-6"
        >
          Format selection required
        </Checkbox>
        <div className="mt-6 space-y-3">
          {event.formats.length > 0 && <TrackList tracks={event.formats} />}
          <Button iconLeft={PlusIcon} variant="secondary">
            New format
          </Button>
        </div>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Categories</H2>
        <Checkbox
          id="categoriesRequired"
          name="categoriesRequired"
          description="When a speaker submit a proposal, the category selection is mandatory."
          className="mt-6"
        >
          Category selection required
        </Checkbox>
        <div className="mt-6 space-y-3">
          {event.categories.length > 0 && <TrackList tracks={event.categories} />}
          <Button iconLeft={PlusIcon} variant="secondary">
            New Category
          </Button>
        </div>
      </section>
    </>
  );
}

type TrackListProps = {
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

function TrackList({ tracks }: TrackListProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {tracks.map((track) => (
        <li key={track.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
          <div className="truncate">
            <Text className="truncate">{track.name}</Text>
            <Text className="truncate" variant="secondary">
              {track.description}
            </Text>
          </div>
          <div className="ml-4 flex-shrink-0 space-x-2">
            <IconButton icon={PencilIcon} size="xs" variant="secondary" aria-label={`Edit ${track.name}`} />
            <IconButton icon={TrashIcon} size="xs" variant="secondary" aria-label={`Remove ${track.name}`} />
          </div>
        </li>
      ))}
    </ul>
  );
}
