import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2, Subtitle, Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useFetcher } from '@remix-run/react';
import { IconButton } from '~/design-system/IconButtons';
import { TrashIcon } from '@heroicons/react/20/solid';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { deleteCategory, deleteFormat, saveCategory, saveFormat } from './server/update-tracks.server';
import { EditTrackButton, NewTrackButton } from './components/SaveTrackForm';
import { EventTrackSaveSchema } from './types/event-track-save.schema';
import { EventTracksSettingsSchema } from './types/event-track-settings.schema';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await requireSession(request);
  invariant(params.orga, 'Invalid organization slug');
  invariant(params.event, 'Invalid event slug');
  const formData = await request.formData();

  const action = formData.get('_action');

  switch (action) {
    case 'delete-formats': {
      const trackId = String(formData.get('trackId'));
      await deleteFormat(params.orga, params.event, uid, trackId);
      break;
    }
    case 'delete-categories': {
      const trackId = String(formData.get('trackId'));
      await deleteCategory(params.orga, params.event, uid, trackId);
      break;
    }
    case 'save-formats': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveFormat(params.orga, params.event, uid, results.data);
      break;
    }
    case 'save-categories': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveCategory(params.orga, params.event, uid, results.data);
      break;
    }
    case 'update-track-settings': {
      const results = await withZod(EventTracksSettingsSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await updateEvent(params.orga, params.event, uid, results.data);
      break;
    }
  }
  return null;
};

export default function EventTracksSettingsRoute() {
  const { event } = useOrganizerEvent();

  const fetcher = useFetcher();
  const handleUpdateSettings = (e: ChangeEvent<HTMLInputElement>) => {
    fetcher.submit(
      { _action: 'update-track-settings', [e.currentTarget.name]: String(e.currentTarget.checked) },
      { method: 'POST' }
    );
  };

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2 size="xl">Formats</H2>
          <Subtitle>Define talk formats available for your event proposals.</Subtitle>
        </Card.Title>
        {event.formats.length > 0 && (
          <Card.Content>
            <TrackList type="formats" tracks={event.formats} />
            <Checkbox
              id="formatsRequired"
              name="formatsRequired"
              defaultChecked={event.formatsRequired}
              onChange={handleUpdateSettings}
              description="When a speaker submit a proposal, the format selection is mandatory."
              disabled={event.formats.length === 0}
            >
              Make format selection required
            </Checkbox>
          </Card.Content>
        )}
        <Card.Actions>
          <NewTrackButton type="formats" />
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2 size="xl">Categories</H2>
          <Subtitle>Define talk categories available for your event proposals.</Subtitle>
        </Card.Title>
        {event.categories.length > 0 && (
          <Card.Content>
            <TrackList type="categories" tracks={event.categories} />
            <Checkbox
              id="categoriesRequired"
              name="categoriesRequired"
              defaultChecked={event.categoriesRequired}
              onChange={handleUpdateSettings}
              description="When a speaker submit a proposal, the category selection is mandatory."
              disabled={event.categories.length === 0}
            >
              Make category selection required
            </Checkbox>
          </Card.Content>
        )}
        <Card.Actions>
          <NewTrackButton type="categories" />
        </Card.Actions>
      </Card>
    </>
  );
}

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

function TrackList({ type, tracks }: TrackListProps) {
  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {tracks.map((track) => (
        <li key={track.id} className="flex items-center justify-between py-3 pl-3 pr-4">
          <div className="truncate">
            <Text size="s" strong truncate>
              {track.name}
            </Text>
            <Subtitle truncate>{track.description}</Subtitle>
          </div>
          <div className="ml-4 flex flex-shrink-0 gap-2">
            <EditTrackButton type={type} initialValues={track} />
            <Form method="POST">
              <input type="hidden" name="_action" value={`delete-${type}`} />
              <input type="hidden" name="trackId" value={track.id} />
              <IconButton icon={TrashIcon} size="xs" variant="secondary" label={`Remove ${track.name}`} />
            </Form>
          </div>
        </li>
      ))}
    </ul>
  );
}
