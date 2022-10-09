import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form, useFetcher, useOutletContext } from '@remix-run/react';
import type { OrganizerEventContext } from '../../$eventSlug';
import { IconButton } from '~/design-system/IconButtons';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  deleteCategory,
  deleteFormat,
  saveCategory,
  saveFormat,
  updateEvent,
} from '~/services/organizers/event.server';
import { EditTrackButton, NewTrackButton } from '~/components/event-forms/SaveTrackForm';
import { withZod } from '@remix-validated-form/with-zod';
import { EventTrackSaveSchema, EventTracksSettingsSchema } from '~/schemas/event';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const formData = await request.formData();

  const action = formData.get('_action');

  switch (action) {
    case 'delete-formats': {
      const trackId = String(formData.get('trackId'));
      await deleteFormat(slug!, eventSlug!, uid, trackId);
      break;
    }
    case 'delete-categories': {
      const trackId = String(formData.get('trackId'));
      await deleteCategory(slug!, eventSlug!, uid, trackId);
      break;
    }
    case 'save-formats': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveFormat(slug!, eventSlug!, uid, results.data);
      break;
    }
    case 'save-categories': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveCategory(slug!, eventSlug!, uid, results.data);
      break;
    }
    case 'update-track-settings': {
      const results = await withZod(EventTracksSettingsSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await updateEvent(slug!, eventSlug!, uid, results.data);
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
        <H2 className="border-b border-gray-200 pb-3">Formats</H2>
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
        <H2 className="border-b border-gray-200 pb-3">Categories</H2>
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
            <Text className="truncate">{track.name}</Text>
            <Text className="truncate" variant="secondary">
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
