import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { UserEvent } from '~/.server/event-settings/user-event.ts';
import {
  CfpConferenceOpeningSchema,
  CfpMeetupOpeningSchema,
  CfpPreferencesSchema,
} from '~/.server/event-settings/user-event.types.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { useEvent } from '../__components/use-event.tsx';
import { CommonCfpSetting } from './__components/common-cfp-setting.tsx';
import { ConferenceCfpOpening } from './__components/conference-cfp-opening.tsx';
import { MeetupCfpOpening } from './__components/meetup-cfp-opening.tsx';

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
      const result = parseWithZod(form, { schema: CfpPreferencesSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      break;
    }
    case 'save-cfp-conference-opening': {
      const result = parseWithZod(form, { schema: CfpConferenceOpeningSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      break;
    }
    case 'save-cfp-meetup-opening': {
      const result = parseWithZod(form, { schema: CfpMeetupOpeningSchema });
      if (result.status !== 'success') return json(result.error);
      await event.update(result.value);
      break;
    }
  }

  return toast('success', 'Call for paper updated.');
};

export default function EventCfpSettingsRoute() {
  const { event } = useEvent();
  const errors = useActionData<typeof action>();

  return (
    <>
      {event.type === 'CONFERENCE' ? (
        <ConferenceCfpOpening
          cfpStart={event.cfpStart}
          cfpEnd={event.cfpEnd}
          timezone={event.timezone}
          errors={errors}
        />
      ) : (
        <MeetupCfpOpening cfpStart={event.cfpStart} timezone={event.timezone} />
      )}

      <CommonCfpSetting maxProposals={event.maxProposals} codeOfConductUrl={event.codeOfConductUrl} errors={errors} />
    </>
  );
}
