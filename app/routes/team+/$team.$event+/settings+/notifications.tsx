import { parseWithZod } from '@conform-to/zod';
import { Form, useFetcher } from 'react-router';
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
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context';
import type { Route } from './+types/notifications.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-email-notifications': {
      const result = parseWithZod(form, { schema: EventEmailNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', 'Notification email saved.');
    }
    case 'save-notifications': {
      const result = parseWithZod(form, { schema: EventNotificationsSettingsSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      return toast('success', 'Notification setting saved.');
    }
  }
  return null;
};

export default function EventNotificationsSettingsRoute({ actionData: errors }: Route.ComponentProps) {
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
          <H2>Email notifications</H2>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="email-notifications-form" className="flex items-end gap-4">
            <Input
              name="emailOrganizer"
              label="Email receiving notifications"
              placeholder="contact@email.com"
              defaultValue={emailOrganizer || ''}
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
            value={emailNotifications?.includes('submitted')}
            onChange={(checked) => handleChangeNotification('submitted', checked)}
          />
          <ToggleGroup
            label="Confirmed proposals"
            description="Receive an email when a speaker confirm a talk."
            value={emailNotifications?.includes('confirmed')}
            onChange={(checked) => handleChangeNotification('confirmed', checked)}
          />
          <ToggleGroup
            label="Declined proposals"
            description="Receive an email when a speaker decline a talk."
            value={emailNotifications?.includes('declined')}
            onChange={(checked) => handleChangeNotification('declined', checked)}
          />
        </Card.Content>
      </Card>
    </>
  );
}
