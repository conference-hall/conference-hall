import invariant from 'tiny-invariant';
import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/libs/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useFetcher, useOutletContext } from '@remix-run/react';
import type { OrganizerEventContext } from '../organizer.$orga.$event/route';
import { IconButton } from '~/design-system/IconButtons';
import { TrashIcon } from '@heroicons/react/24/outline';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { deleteCategory, deleteFormat, saveCategory, saveFormat } from './server/update-tracks.server';
import { EditTrackButton, NewTrackButton } from './components/SaveTrackForm';
import { EventTrackSaveSchema } from './types/event-track-save.schema';
import { EventTracksSettingsSchema } from './types/event-track-settings.schema';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
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
  const fetcher = useFetcher();

  const handleUpdateSettings = (e: ChangeEvent<HTMLInputElement>) => {
    fetcher.submit(
      { _action: 'update-track-settings', [e.currentTarget.name]: String(e.currentTarget.checked) },
      { method: 'post' }
    );
  };

  const { event } = useOutletContext<OrganizerEventContext>();
  return (
    <>
      <section>
        <H2>Formats</H2>
        <Checkbox
          id="formatsRequired"
          name="formatsRequired"
          defaultChecked={event.formatsRequired}
          onChange={handleUpdateSettings}
          description="When a speaker submit a proposal, the format selection is mandatory."
          className="mt-6"
        >
          Format selection required
        </Checkbox>
        <div className="mt-6 space-y-3">
          {event.formats.length > 0 && <TrackList type="formats" tracks={event.formats} />}
          <NewTrackButton type="formats" />
        </div>
      </section>
      <section>
        <H2>Categories</H2>
        <Checkbox
          id="categoriesRequired"
          name="categoriesRequired"
          defaultChecked={event.categoriesRequired}
          onChange={handleUpdateSettings}
          description="When a speaker submit a proposal, the category selection is mandatory."
          className="mt-6"
        >
          Category selection required
        </Checkbox>
        <div className="mt-6 space-y-3">
          {event.categories.length > 0 && <TrackList type="categories" tracks={event.categories} />}
          <NewTrackButton type="categories" />
        </div>
      </section>
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
        <li key={track.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
          <div className="truncate">
            <Text truncate>{track.name}</Text>
            <Text variant="secondary" truncate>
              {track.description}
            </Text>
          </div>
          <div className="ml-4 flex flex-shrink-0 gap-2">
            <EditTrackButton type={type} initialValues={track} />
            <Form method="post">
              <input type="hidden" name="_action" value={`delete-${type}`} />
              <input type="hidden" name="trackId" value={track.id} />
              <IconButton icon={TrashIcon} size="xs" variant="secondary" aria-label={`Remove ${track.name}`} />
            </Form>
          </div>
        </li>
      ))}
    </ul>
  );
}
