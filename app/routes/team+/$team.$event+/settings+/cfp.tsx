import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/domains/organizer-event/UserEvent.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useTeamEvent } from '../_layout.tsx';
import { CommonCfpSetting } from './__components/CommonCfpSetting.tsx';
import { ConferenceCfpOpening } from './__components/ConferenceCfpOpening.tsx';
import { MeetupCfpOpening } from './__components/MeetupCfpOpening.tsx';
import * as schemas from './__types/event-cfp-settings.schema.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const event = UserEvent.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');
  switch (intent) {
    case 'save-cfp-preferences': {
      const result = parse(form, { schema: schemas.CfpPreferencesSchema });
      if (!result.value) return json(result.error);
      await event.update(result.value);
      break;
    }
    case 'save-cfp-conference-opening': {
      const result = parse(form, { schema: schemas.CfpConferenceOpeningSchema });
      if (!result.value) return json(result.error);
      await event.update(result.value);
      break;
    }
    case 'save-cfp-meetup-opening': {
      const result = parse(form, { schema: schemas.CfpMeetupOpeningSchema });
      if (!result.value) return json(result.error);
      await event.update(result.value);
      break;
    }
  }

  return toast('success', 'Call for paper updated.');
};

export default function EventCfpSettingsRoute() {
  const { event } = useTeamEvent();
  const errors = useActionData<typeof action>();

  return (
    <>
      {event.type === 'CONFERENCE' ? (
        <ConferenceCfpOpening cfpStart={event.cfpStart} cfpEnd={event.cfpEnd} errors={errors} />
      ) : (
        <MeetupCfpOpening cfpStart={event.cfpStart} />
      )}

      <CommonCfpSetting maxProposals={event.maxProposals} codeOfConductUrl={event.codeOfConductUrl} errors={errors} />
    </>
  );
}
