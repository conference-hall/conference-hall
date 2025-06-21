import { v4 as uuid } from 'uuid';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { EventProposalApiTryout, EventScheduleApiTryout } from '../components/settings-page/api-tryout-section.tsx';
import { EnableApiSection } from '../components/settings-page/enable-api-section.tsx';
import type { Route } from './+types/api.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent');
  const event = UserEvent.for(userId, params.team, params.event);

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
  const { slug, apiKey, type } = useCurrentEvent();

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
