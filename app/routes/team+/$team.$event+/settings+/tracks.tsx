import { parseWithZod } from '@conform-to/zod';
import { useFetcher } from 'react-router';
import { EventTracksSettings } from '~/.server/event-settings/event-tracks-settings.ts';
import { TrackSaveSchema, TracksSettingsSchema } from '~/.server/event-settings/event-tracks-settings.types.ts';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import type { Route } from './+types/tracks.ts';
import { TrackList } from './components/track-list.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
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
      if (result.status !== 'success') return result.error;
      await tracks.saveFormat(result.value);
      break;
    }
    case 'save-categories': {
      const result = parseWithZod(form, { schema: TrackSaveSchema });
      if (result.status !== 'success') return result.error;
      await tracks.saveCategory(result.value);
      break;
    }
    case 'update-track-settings': {
      const result = parseWithZod(form, { schema: TracksSettingsSchema });
      if (result.status !== 'success') return result.error;
      await tracks.updateSettings(result.value);
      return toast('success', 'Track setting updated.');
    }
  }
  return null;
};

export default function EventTracksSettingsRoute() {
  const currentEvent = useCurrentEvent();
  const fetcher = useFetcher<typeof action>();
  const handleUpdateSettings = (name: string, checked: boolean) => {
    fetcher.submit(
      {
        intent: 'update-track-settings',
        formatsRequired: currentEvent.formatsRequired,
        formatsAllowMultiple: currentEvent.formatsAllowMultiple,
        categoriesRequired: currentEvent.categoriesRequired,
        categoriesAllowMultiple: currentEvent.categoriesAllowMultiple,
        [name]: String(checked),
      },
      { method: 'POST' },
    );
  };

  return (
    <>
      <Card as="section" p={8} className="space-y-8">
        <div>
          <H2>Formats</H2>
          <Subtitle>Define talk formats available for your event proposals.</Subtitle>
        </div>

        <TrackList type="formats" tracks={currentEvent.formats} />

        {currentEvent.formats.length > 0 && (
          <>
            <ToggleGroup
              label="Format selection required"
              description="When a speaker submit a proposal, the format selection is mandatory."
              value={currentEvent.formatsRequired}
              onChange={(checked) => handleUpdateSettings('formatsRequired', checked)}
            />
            <ToggleGroup
              label="Allow multiple formats"
              description="Determines whether the input allows users to select multiple formats."
              value={currentEvent.formatsAllowMultiple}
              onChange={(checked) => handleUpdateSettings('formatsAllowMultiple', checked)}
            />
          </>
        )}
      </Card>

      <Card as="section" p={8} className="space-y-8">
        <div>
          <H2>Categories</H2>
          <Subtitle>Define talk categories available for your event proposals.</Subtitle>
        </div>

        <TrackList type="categories" tracks={currentEvent.categories} />

        {currentEvent.categories.length > 0 && (
          <>
            <ToggleGroup
              label="Category selection required"
              description="When a speaker submit a proposal, the category selection is mandatory."
              value={currentEvent.categoriesRequired}
              onChange={(checked) => handleUpdateSettings('categoriesRequired', checked)}
            />
            <ToggleGroup
              label="Allow multiple categories"
              description="Determines whether the input allows users to select multiple categories."
              value={currentEvent.categoriesAllowMultiple}
              onChange={(checked) => handleUpdateSettings('categoriesAllowMultiple', checked)}
            />
          </>
        )}
      </Card>
    </>
  );
}
