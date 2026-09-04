import { randomUUID } from 'node:crypto';
import { useLoaderData } from 'react-router';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { ProposalsExport } from '~/features/event-management/proposals-export/services/proposals-export.server.ts';
import { EventScheduleExport } from '~/features/event-management/schedule-export/services/schedule-export.server.ts';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { EventType } from '../../../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../../../servers/environment.server.ts';
import type { Route } from './+types/api.ts';
import { ApiKeySection } from './components/api-key-section.tsx';
import { EventProposalApiTryout, EventScheduleApiTryout } from './components/api-tryout-section.tsx';

export const loader = ({ context }: Route.LoaderArgs) => {
  const { APP_URL } = getSharedServerEnv();
  const { event } = context.get(AuthorizedEventContext);

  // Response samples come from the export services (the API code path) so they stay in sync with the real shape.
  const proposalsResponse = JSON.stringify(ProposalsExport.sampleJson(), null, 2);
  const scheduleResponse =
    event.type === EventType.CONFERENCE ? JSON.stringify(EventScheduleExport.sampleJson(), null, 2) : null;

  return { appUrl: APP_URL, proposalsResponse, scheduleResponse };
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const form = await request.formData();
  const intent = form.get('intent');
  const event = EventSettings.for(authorizedEvent);

  switch (intent) {
    case 'revoke-api-key': {
      await event.update({ apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await event.update({ apiKey: randomUUID() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { event } = useCurrentEventTeam();
  const { appUrl, proposalsResponse, scheduleResponse } = useLoaderData<typeof loader>();
  const { slug, apiKey, type, formats, categories, tags } = event;

  return (
    <>
      <ApiKeySection apiKey={apiKey} />

      {apiKey ? (
        <>
          <EventProposalApiTryout
            slug={slug}
            apiKey={apiKey}
            appUrl={appUrl}
            formats={formats}
            categories={categories}
            tags={tags}
            responseExample={proposalsResponse}
          />
          {type === 'CONFERENCE' ? (
            <EventScheduleApiTryout slug={slug} apiKey={apiKey} appUrl={appUrl} responseExample={scheduleResponse} />
          ) : null}
        </>
      ) : null}
    </>
  );
}
