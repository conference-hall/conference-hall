import { v4 as uuid } from 'uuid';
import { useCurrentEventTeam } from '~/features/event-management/event-team-context.tsx';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/api.ts';
import { EventProposalApiTryout, EventScheduleApiTryout } from './components/api-tryout-section.tsx';
import { EnableApiSection } from './components/enable-api-section.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent');
  const event = EventSettings.for(userId, params.team, params.event);

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
  const { slug, apiKey, type } = event;

  return (
    <>
      <EnableApiSection apiKey={apiKey} />
      {apiKey ? (
        <>
          <EventProposalApiTryout slug={slug} apiKey={apiKey} />
          {type === 'CONFERENCE' ? <EventScheduleApiTryout slug={slug} apiKey={apiKey} /> : null}
        </>
      ) : null}
    </>
  );
}
