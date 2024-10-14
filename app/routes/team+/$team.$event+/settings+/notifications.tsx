import { parseWithZod } from '@conform-to/zod';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useFetcher } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import {
  EventEmailNotificationsSettingsSchema,
  EventNotificationsSettingsSchema,
} from '~/.server/event-settings/user-event.types.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useEvent } from '../__components/use-event.tsx';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-email-notifications': {
      const result = parseWithZod(form, { schema: EventEmailNotificationsSettingsSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      return toast('success', 'Notification email saved.');
    }
    case 'save-notifications': {
      const result = parseWithZod(form, { schema: EventNotificationsSettingsSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      return toast('success', 'Notification setting saved.');
    }
  }
  return json(null);
};

export default function EventNotificationsSettingsRoute() {
  const { event } = useEvent();
  const errors = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();

  const handleChangeNotification = (name: string, checked: boolean) => {
    const form = new FormData();
    form.set('intent', 'save-notifications');

    if (checked) {
      for (const notification of event.emailNotifications) {
        form.append('emailNotifications', notification);
      }
      form.append('emailNotifications', name);
    } else {
      for (const notification of event.emailNotifications.filter((n) => n !== name)) {
        form.append('emailNotifications', notification);
      }
    }
    fetcher.submit(form, { method: 'POST' });
  };

  return (
    <>
      <Card as="section">
        <Card.Title>
          <H2>Email notifications</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="email-notifications-form" className="flex items-end gap-4">
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
          <Button type="submit" name="intent" value="save-email-notifications" form="email-notifications-form">
            Save email
          </Button>
        </Card.Actions>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>Notifications</H2>
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
