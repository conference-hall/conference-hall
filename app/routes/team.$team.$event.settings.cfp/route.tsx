import { parse } from '@conform-to/zod';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { requireSession } from '~/libs/auth/session';
import { addToast } from '~/libs/toasts/toasts';
import { updateEvent } from '~/server/teams/update-event.server';

import { useOrganizerEvent } from '../team.$team.$event+/_layout';
import { CommonCfpSetting } from './components/CommonCfpSetting';
import { ConferenceCfpOpening } from './components/ConferenceCfpOpening';
import { MeetupCfpOpening } from './components/MeetupCfpOpening';
import * as schemas from './types/event-cfp-settings.schema';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
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
