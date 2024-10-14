import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventTracksSettings } from '~/.server/event-settings/event-tracks-settings.ts';
import { TrackSaveSchema, TracksSettingsSchema } from '~/.server/event-settings/event-tracks-settings.types.ts';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useEvent } from '../__components/use-event.tsx';
import { NewTrackButton } from './__components/save-track-form.tsx';
import { TrackList } from './__components/track-list.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const tracks = EventTracksSettings.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'delete-formats': {
      const trackId = String(form.get('trackId'));
      await tracks.deleteFormat(trackId);
      break;
    }
    case 'delete-categories': {
      const trackId = String(form.get('trackId'));
      await tracks.deleteCategory(trackId);
      break;
    }
    case 'save-formats': {
      const result = parseWithZod(form, { schema: TrackSaveSchema });
      if (result.status !== 'success') return json(result.error);
      await tracks.saveFormat(result.value);
      break;
    }
    case 'save-categories': {
      const result = parseWithZod(form, { schema: TrackSaveSchema });
      if (result.status !== 'success') return json(result.error);
      await tracks.saveCategory(result.value);
      break;
    }
    case 'update-track-settings': {
      const result = parseWithZod(form, { schema: TracksSettingsSchema });
      if (result.status !== 'success') return json(result.error);
      await tracks.updateSettings(result.value);
      return toast('success', 'Track setting updated.');
    }
  }
  return null;
};

export default function EventTracksSettingsRoute() {
  const { event } = useEvent();

  const fetcher = useFetcher<typeof action>();
  const handleUpdateSettings = (name: string, checked: boolean) => {
    fetcher.submit(
      {
        intent: 'update-track-settings',
        formatsRequired: event.formatsRequired,
        formatsAllowMultiple: event.formatsAllowMultiple,
        categoriesRequired: event.categoriesRequired,
        categoriesAllowMultiple: event.categoriesAllowMultiple,
        [name]: String(checked),
      },
      { method: 'POST' },
    );
  };

  return (
    <>
      <Card as="section" p={8} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <H2>Formats</H2>
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
            <ToggleGroup
              label="Allow multiple formats"
              description="Determines whether the input allows users to select multiple formats."
              value={event.formatsAllowMultiple}
              onChange={(checked) => handleUpdateSettings('formatsAllowMultiple', checked)}
            />
          </>
        )}
      </Card>

      <Card as="section" p={8} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <H2>Categories</H2>
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
            <ToggleGroup
              label="Allow multiple categories"
              description="Determines whether the input allows users to select multiple categories."
              value={event.categoriesAllowMultiple}
              onChange={(checked) => handleUpdateSettings('categoriesAllowMultiple', checked)}
            />
          </>
        )}
      </Card>
    </>
  );
}
