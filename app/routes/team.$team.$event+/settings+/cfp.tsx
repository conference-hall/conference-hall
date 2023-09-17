import { parse } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session.ts';
import { addToast } from '~/libs/toasts/toasts.ts';
import { updateEvent } from '~/routes/__server/teams/update-event.server.ts';

import { useOrganizerEvent } from '../_layout.tsx';
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
  invariant(params.event, 'Invalid event slug');
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-cfp-preferences': {
      const result = parse(form, { schema: schemas.CfpPreferencesSchema });
      if (!result.value) return json(result.error);
      await updateEvent(params.event, userId, result.value);
      break;
    }
    case 'save-cfp-conference-opening': {
      const result = parse(form, { schema: schemas.CfpConferenceOpeningSchema });
      if (!result.value) return json(result.error);
      await updateEvent(params.event, userId, result.value);
      break;
    }
    case 'save-cfp-meetup-opening': {
      const result = parse(form, { schema: schemas.CfpMeetupOpeningSchema });
      if (!result.value) return json(result.error);
      await updateEvent(params.event, userId, result.value);
      break;
    }
  }

  return json(null, await addToast(request, 'Call for paper updated.'));
};

export default function EventCfpSettingsRoute() {
  const { event } = useOrganizerEvent();
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
