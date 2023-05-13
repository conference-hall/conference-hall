import invariant from 'tiny-invariant';
import { json } from '@remix-run/node';
import type { LoaderArgs } from '@remix-run/node';
import { Form, useActionData, useFetcher } from '@remix-run/react';
import { H2 } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { requireSession } from '~/libs/auth/session';
import { updateEvent } from '~/server/teams/update-event.server';
import { useOrganizerEvent } from '../team.$team.$event/route';
import { EventEmailNotificationsSettingsSchema } from './types/event-email-notifications-settings.schema';
import { EventNotificationsSettingsSchema } from './types/event-notifications-settings.schema';
import { Card } from '~/design-system/layouts/Card';
import { ToggleGroup } from '~/design-system/forms/Toggles';
import { addToast } from '~/libs/toasts/toasts';
import { parse } from '@conform-to/zod';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const action = form.get('_action');

  switch (action) {
    case 'save-email-notifications': {
      const result = parse(form, { schema: EventEmailNotificationsSettingsSchema });
      if (!result.value) return json(result.error);
      await updateEvent(params.event, userId, result.value);
      return json(null, await addToast(request, 'Notification email saved.'));
    }
    case 'save-notifications': {
      const result = parse(form, { schema: EventNotificationsSettingsSchema });
      if (!result.value) return json(result.error);
      await updateEvent(params.event, userId, result.value);
      return json(null, await addToast(request, 'Notification setting saved.'));
    }
  }
  return json(null);
};

export default function EventNotificationsSettingsRoute() {
  const { event } = useOrganizerEvent();
  const errors = useActionData<typeof action>();
  const fetcher = useFetcher();

  const handleChangeNotification = (name: string, checked: boolean) => {
    const form = new FormData();
    form.set('_action', 'save-notifications');

    if (checked) {
      event.emailNotifications.forEach((n) => form.append('emailNotifications', n));
      form.append('emailNotifications', name);
    } else {
      event.emailNotifications.filter((n) => n !== name).forEach((n) => form.append('emailNotifications', n));
    }
    fetcher.submit(form, { method: 'POST' });
  };

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2 size="base">Email notifications</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="email-notifications-form" className="flex items-end gap-4">
            <input type="hidden" name="_action" value="save-email-notifications" />
            <Input
              name="emailOrganizer"
              label="Email receiving notifications"
              placeholder="contact@email.com"
              defaultValue={event.emailOrganizer || ''}
              error={errors?.emailOrganizer}
              className="grow"
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form="email-notifications-form">
            Save email
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2 size="base">Notifications</H2>
        </Card.Title>

        <Card.Content>
          <ToggleGroup
            label="Submitted proposals"
            description="Receive an email when a speaker submit a talk."
            value={event.emailNotifications?.includes('submitted')}
            onChange={(checked) => handleChangeNotification('submitted', checked)}
          />
          <ToggleGroup
            label="Confirmed proposals"
            description="Receive an email when a speaker confirm a talk."
            value={event.emailNotifications?.includes('confirmed')}
            onChange={(checked) => handleChangeNotification('confirmed', checked)}
          />
          <ToggleGroup
            label="Declined proposals"
            description="Receive an email when a speaker decline a talk."
            value={event.emailNotifications?.includes('declined')}
            onChange={(checked) => handleChangeNotification('declined', checked)}
          />
        </Card.Content>
      </Card>
    </>
  );
}
