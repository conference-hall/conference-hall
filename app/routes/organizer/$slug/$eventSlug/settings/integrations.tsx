import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { ExternalLink } from '~/design-system/Links';
import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import type { OrganizerEventContext } from '../../$eventSlug';
import { updateEvent, validateSlackIntegration } from '~/services/organizers/event.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  const { slug, eventSlug } = params;
  const form = await request.formData();
  const result = validateSlackIntegration(form);
  if (!result.success) return json(result.error.flatten());
  await updateEvent(slug!, eventSlug!, uid, result.data);
  return null;
};

export default function EventIntegrationsSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const result = useActionData();
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Slack integration</H2>
        <Text variant="secondary" className="mt-6">
          With Slack integration you will be able to received notifications about speakers in a dedicated Slack channel.
          Follow the 3 steps of the{' '}
          <ExternalLink href="https://api.slack.com/incoming-webhooks">Slack documentation</ExternalLink> to get the
          Incoming Web Hook URL and choose the channel.
        </Text>

        <Form method="post" className="mt-6 space-y-4">
          <Input
            name="slackWebhookUrl"
            label="Web hook URL"
            defaultValue={event.slackWebhookUrl || ''}
            error={result?.fieldErrors?.slackWebhookUrl?.[0]}
          />
          <Button type="submit" variant="secondary">
            Save Web hook URL
          </Button>
        </Form>
      </section>
    </>
  );
}
