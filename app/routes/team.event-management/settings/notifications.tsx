import { parseWithZod } from '@conform-to/zod';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import {
  EventEmailNotificationsSettingsSchema,
  EventNotificationsSettingsSchema,
} from '~/.server/event-settings/user-event.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { ToggleGroup } from '~/shared/design-system/forms/toggles.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2 } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/notifications.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-email-notifications': {
      const result = parseWithZod(form, { schema: EventEmailNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', t('event-management.settings.notifications.feedbacks.email-saved'));
    }
    case 'save-notifications': {
      const result = parseWithZod(form, { schema: EventNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', t('event-management.settings.notifications.feedbacks.settings-saved'));
    }
  }
  return null;
};

export default function EventNotificationsSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { emailNotifications, emailOrganizer } = useCurrentEvent();
  const fetcher = useFetcher<typeof action>();

  const handleChangeNotification = (name: string, checked: boolean) => {
    const form = new FormData();
    form.set('intent', 'save-notifications');

    if (checked) {
      for (const notification of emailNotifications) {
        form.append('emailNotifications', notification);
      }
      form.append('emailNotifications', name);
    } else {
      for (const notification of emailNotifications.filter((n) => n !== name)) {
        form.append('emailNotifications', notification);
      }
    }
    fetcher.submit(form, { method: 'POST' });
  };

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
              defaultValue={emailOrganizer || ''}
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
            value={emailNotifications?.includes('submitted')}
            onChange={(checked) => handleChangeNotification('submitted', checked)}
          />
          <ToggleGroup
            label={t('event-management.settings.notifications.settings.confirmed.label')}
            description={t('event-management.settings.notifications.settings.confirmed.description')}
            value={emailNotifications?.includes('confirmed')}
            onChange={(checked) => handleChangeNotification('confirmed', checked)}
          />
          <ToggleGroup
            label={t('event-management.settings.notifications.settings.declined.label')}
            description={t('event-management.settings.notifications.settings.declined.description')}
            value={emailNotifications?.includes('declined')}
            onChange={(checked) => handleChangeNotification('declined', checked)}
          />
        </Card.Content>
      </Card>
    </>
  );
}
