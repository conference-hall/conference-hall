import invariant from 'tiny-invariant';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireSession } from '~/libs/auth/session';
import { H2, Subtitle } from '~/design-system/Typography';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { updateEvent } from '~/shared-server/organizations/update-event.server';
import { deleteCategory, deleteFormat, saveCategory, saveFormat } from './server/update-tracks.server';
import { NewTrackButton } from './components/SaveTrackForm';
import { EventTrackSaveSchema } from './types/event-track-save.schema';
import { EventTracksSettingsSchema } from './types/event-track-settings.schema';
import { useOrganizerEvent } from '../organizer.$orga.$event/route';
import { Card } from '~/design-system/layouts/Card';
import { TrackList } from './components/TrackList';
import { ToggleGroup } from '~/design-system/forms/Toggles';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const formData = await request.formData();

  const action = formData.get('_action');

  switch (action) {
    case 'delete-formats': {
      const trackId = String(formData.get('trackId'));
      await deleteFormat(params.event, userId, trackId);
      break;
    }
    case 'delete-categories': {
      const trackId = String(formData.get('trackId'));
      await deleteCategory(params.event, userId, trackId);
      break;
    }
    case 'save-formats': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveFormat(params.event, userId, results.data);
      break;
    }
    case 'save-categories': {
      const results = await withZod(EventTrackSaveSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await saveCategory(params.event, userId, results.data);
      break;
    }
    case 'update-track-settings': {
      const results = await withZod(EventTracksSettingsSchema).validate(formData);
      if (results.error) return json(results.error.fieldErrors);
      await updateEvent(params.event, userId, results.data);
      break;
    }
  }
  return null;
};

export default function EventTracksSettingsRoute() {
  const { event } = useOrganizerEvent();

  const fetcher = useFetcher();
  const handleUpdateSettings = (name: string, checked: boolean) => {
    fetcher.submit({ _action: 'update-track-settings', [name]: String(checked) }, { method: 'POST' });
  };

  return (
    <>
      <Card as="section" p={8} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <H2 size="base">Formats</H2>
            <Subtitle>Define talk formats available for your event proposals.</Subtitle>
          </div>
          <NewTrackButton type="formats" />
        </div>

        {event.formats.length > 0 && (
          <>
            <TrackList type="formats" tracks={event.formats} />
            <ToggleGroup
              label="Format selection required"
              description="When a speaker submit a proposal, the format selection is mandatory."
              value={event.formatsRequired}
              onChange={(checked) => handleUpdateSettings('formatsRequired', checked)}
            />
          </>
        )}
      </Card>

      <Card as="section" p={8} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <H2 size="base">Categories</H2>
            <Subtitle>Define talk categories available for your event proposals.</Subtitle>
          </div>
          <NewTrackButton type="categories" />
        </div>

        {event.categories.length > 0 && (
          <>
            <TrackList type="categories" tracks={event.categories} />
            <ToggleGroup
              label="Category selection required"
              description="When a speaker submit a proposal, the category selection is mandatory."
              value={event.categoriesRequired}
              onChange={(checked) => handleUpdateSettings('categoriesRequired', checked)}
            />
          </>
        )}
      </Card>
    </>
  );
}
