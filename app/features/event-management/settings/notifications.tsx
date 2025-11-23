import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import {
  EventEmailNotificationsSettingsSchema,
  EventNotificationsSettingsSchema,
} from '~/features/event-management/settings/services/event-settings.schema.server.ts';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { getProtectedSession } from '~/shared/auth/auth.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { EventEmailNotificationsKeys } from '~/shared/types/events.types.ts';
import type { Route } from './+types/notifications.ts';

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = getProtectedSession(context);
  const i18n = getI18n(context);
  const event = EventSettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-email-notifications': {
      const result = parseWithZod(form, { schema: EventEmailNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', i18n.t('event-management.settings.notifications.feedbacks.email-saved'));
    }
    case 'save-notifications': {
      const result = parseWithZod(form, { schema: EventNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', i18n.t('event-management.settings.notifications.feedbacks.settings-saved'));
    }
  }
  return null;
};

export default function EventNotificationsSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { event } = useCurrentEventTeam();
  const { optimisticNotifications, handleChangeNotification } = useOptimisticNotifications(event.emailNotifications);

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.notifications.email.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id={formId} className="flex items-end gap-4">
            <Input
              name="emailOrganizer"
              label={t('event-management.settings.notifications.email.organizer.label')}
              placeholder={t('event-management.settings.notifications.email.organizer.placeholder')}
              defaultValue={event.emailOrganizer || ''}
              error={errors?.emailOrganizer}
              className="grow"
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="save-email-notifications" form={formId}>
            {t('event-management.settings.notifications.email.submit')}
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.notifications.settings.heading')}</H2>
        </Card.Title>

        <Card.Content>
          <ToggleGroup
            label={t('event-management.settings.notifications.settings.submitted.label')}
            description={t('event-management.settings.notifications.settings.submitted.description')}
            value={optimisticNotifications?.includes('submitted')}
            onChange={(checked) => handleChangeNotification('submitted', checked)}
          />
          <ToggleGroup
            label={t('event-management.settings.notifications.settings.confirmed.label')}
            description={t('event-management.settings.notifications.settings.confirmed.description')}
            value={optimisticNotifications?.includes('confirmed')}
            onChange={(checked) => handleChangeNotification('confirmed', checked)}
          />
          <ToggleGroup
            label={t('event-management.settings.notifications.settings.declined.label')}
            description={t('event-management.settings.notifications.settings.declined.description')}
            value={optimisticNotifications?.includes('declined')}
            onChange={(checked) => handleChangeNotification('declined', checked)}
          />
        </Card.Content>
      </Card>
    </>
  );
}

function useOptimisticNotifications(emailNotifications: EventEmailNotificationsKeys) {
  const fetcher = useFetcher<typeof action>({ key: 'notifications' });

  let optimisticNotifications = [...emailNotifications];

  if (fetcher.formData?.get('intent') === 'save-notifications') {
    optimisticNotifications = fetcher.formData.getAll('emailNotifications') as EventEmailNotificationsKeys;
  }

  const handleChangeNotification = (name: 'submitted' | 'confirmed' | 'declined', checked: boolean) => {
    const form = new FormData();
    form.set('intent', 'save-notifications');

    const currentNotifications = optimisticNotifications;
    let newNotifications: string[];
    if (checked) {
      newNotifications = currentNotifications.includes(name) ? currentNotifications : [...currentNotifications, name];
    } else {
      newNotifications = currentNotifications.filter((n) => n !== name);
    }

    for (const notification of newNotifications) {
      form.append('emailNotifications', notification);
    }
    fetcher.submit(form, { method: 'POST' });
  };

  return { optimisticNotifications, handleChangeNotification };
}
