import { useLoaderData } from 'react-router';
import { getSharedServerEnv } from 'servers/environment.server.ts';
import { v4 as uuid } from 'uuid';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import type { Route } from './+types/api.ts';
import { ApiKeySection } from './components/api-key-section.tsx';
import { EventProposalApiTryout, EventScheduleApiTryout } from './components/api-tryout-section.tsx';

export const loader = async () => {
  const { APP_URL } = getSharedServerEnv();
  return { appUrl: APP_URL };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const form = await request.formData();
  const intent = form.get('intent');
  const event = EventSettings.for(authUser.id, params.team, params.event);

  switch (intent) {
    case 'revoke-api-key': {
      await event.update({ apiKey: null });
      break;
    }
    case 'generate-api-key': {
      await event.update({ apiKey: uuid() });
      break;
    }
  }
  return null;
};

export default function EventApiSettingsRoute() {
  const { event } = useCurrentEventTeam();
  const { appUrl } = useLoaderData<typeof loader>();
  const { slug, apiKey, type } = event;

  return (
    <>
      <ApiKeySection apiKey={apiKey} />

      {apiKey ? (
        <>
          <EventProposalApiTryout slug={slug} apiKey={apiKey} appUrl={appUrl} />
          {type === 'CONFERENCE' ? <EventScheduleApiTryout slug={slug} apiKey={apiKey} appUrl={appUrl} /> : null}
        </>
      ) : null}
    </>
  );
}
