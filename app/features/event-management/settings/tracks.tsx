import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/tracks.ts';
import { TrackList } from './components/track-list.tsx';
import {
  TrackReorderSchema,
  TrackSaveSchema,
  TracksSettingsSchema,
} from './services/event-tracks-settings.schema.server.ts';
import { EventTracksSettings } from './services/event-tracks-settings.server.ts';

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const i18n = getI18n(context);
  const tracks = EventTracksSettings.for(authUser.id, params.team, params.event);
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
      const event = EventSettings.for(authUser.id, params.team, params.event);
      await event.update(result.value);
      return toast('success', i18n.t('event-management.settings.tracks.feedbacks.updated'));
    }
    case 'reorder-formats': {
      const result = parseWithZod(form, { schema: TrackReorderSchema });
      if (result.status !== 'success') return result.error;
      await tracks.reorderFormat(result.value.trackId, result.value.direction);
      break;
    }
    case 'reorder-categories': {
      const result = parseWithZod(form, { schema: TrackReorderSchema });
      if (result.status !== 'success') return result.error;
      await tracks.reorderCategory(result.value.trackId, result.value.direction);
      break;
    }
  }
  return null;
};

export default function EventTracksSettingsRoute() {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
  const { optimisticSettings, handleUpdateSettings } = useOptimisticTrackSettings(event);

  return (
    <>
      <Card as="section" p={8} className="space-y-8">
        <div>
          <H2>{t('common.formats')}</H2>
          <Subtitle>{t('event-management.settings.tracks.formats.description')}</Subtitle>
        </div>

        <TrackList type="formats" tracks={event.formats} />

        {event.formats.length > 0 && (
          <>
            <ToggleGroup
              label={t('event-management.settings.tracks.formats.required.label')}
              description={t('event-management.settings.tracks.formats.required.description')}
              value={optimisticSettings.formatsRequired}
              onChange={(checked) => handleUpdateSettings('formatsRequired', checked)}
            />
            <ToggleGroup
              label={t('event-management.settings.tracks.formats.multiple.label')}
              description={t('event-management.settings.tracks.formats.multiple.description')}
              value={optimisticSettings.formatsAllowMultiple}
              onChange={(checked) => handleUpdateSettings('formatsAllowMultiple', checked)}
            />
          </>
        )}
      </Card>

      <Card as="section" p={8} className="space-y-8">
        <div>
          <H2>{t('common.categories')}</H2>
          <Subtitle>{t('event-management.settings.tracks.categories.description')}</Subtitle>
        </div>

        <TrackList type="categories" tracks={event.categories} />

        {event.categories.length > 0 && (
          <>
            <ToggleGroup
              label={t('event-management.settings.tracks.categories.required.label')}
              description={t('event-management.settings.tracks.categories.required.description')}
              value={optimisticSettings.categoriesRequired}
              onChange={(checked) => handleUpdateSettings('categoriesRequired', checked)}
            />
            <ToggleGroup
              label={t('event-management.settings.tracks.categories.multiple.label')}
              description={t('event-management.settings.tracks.categories.multiple.description')}
              value={optimisticSettings.categoriesAllowMultiple}
              onChange={(checked) => handleUpdateSettings('categoriesAllowMultiple', checked)}
            />
          </>
        )}
      </Card>
    </>
  );
}

function useOptimisticTrackSettings(event: {
  formatsRequired: boolean;
  formatsAllowMultiple: boolean;
  categoriesRequired: boolean;
  categoriesAllowMultiple: boolean;
}) {
  const fetcher = useFetcher<typeof action>({ key: 'update-track-settings' });

  let optimisticSettings = {
    formatsRequired: event.formatsRequired,
    formatsAllowMultiple: event.formatsAllowMultiple,
    categoriesRequired: event.categoriesRequired,
    categoriesAllowMultiple: event.categoriesAllowMultiple,
  };

  if (fetcher.formData?.get('intent') === 'update-track-settings') {
    const formData = fetcher.formData;
    optimisticSettings = {
      formatsRequired: formData.get('formatsRequired') === 'true',
      formatsAllowMultiple: formData.get('formatsAllowMultiple') === 'true',
      categoriesRequired: formData.get('categoriesRequired') === 'true',
      categoriesAllowMultiple: formData.get('categoriesAllowMultiple') === 'true',
    };
  }

  const handleUpdateSettings = (name: string, checked: boolean) => {
    const currentSettings = optimisticSettings;

    fetcher.submit(
      {
        intent: 'update-track-settings',
        formatsRequired: currentSettings.formatsRequired,
        formatsAllowMultiple: currentSettings.formatsAllowMultiple,
        categoriesRequired: currentSettings.categoriesRequired,
        categoriesAllowMultiple: currentSettings.categoriesAllowMultiple,
        [name]: String(checked),
      },
      { method: 'POST' },
    );
  };

  return { optimisticSettings, handleUpdateSettings };
}
