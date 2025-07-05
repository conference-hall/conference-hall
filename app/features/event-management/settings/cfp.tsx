import { parseWithZod } from '@conform-to/zod';
import { useCurrentEvent } from '~/features/event-management/event-team-context.tsx';
import {
  CfpConferenceOpeningSchema,
  CfpMeetupOpeningSchema,
  CfpPreferencesSchema,
} from '~/features/event-management/settings/services/event-settings.schema.server.ts';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/cfp.ts';
import { CommonCfpSetting } from './components/common-cfp-setting.tsx';
import { ConferenceCfpOpening } from './components/conference-cfp-opening.tsx';
import { MeetupCfpOpening } from './components/meetup-cfp-opening.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = EventSettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-cfp-preferences': {
      const result = parseWithZod(form, { schema: CfpPreferencesSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      break;
    }
    case 'save-cfp-conference-opening': {
      const result = parseWithZod(form, { schema: CfpConferenceOpeningSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      break;
    }
    case 'save-cfp-meetup-opening': {
      const result = parseWithZod(form, { schema: CfpMeetupOpeningSchema });
      if (result.status !== 'success') return result.error;
      await event.update(result.value);
      break;
    }
  }

  return toast('success', t('event-management.settings.cfp.feedbacks.updated'));
};

export default function EventCfpSettingsRoute({ actionData: errors }: Route.ComponentProps) {
  const currentEvent = useCurrentEvent();

  return (
    <>
      {currentEvent.type === 'CONFERENCE' ? (
        <ConferenceCfpOpening
          cfpStart={currentEvent.cfpStart}
          cfpEnd={currentEvent.cfpEnd}
          timezone={currentEvent.timezone}
          errors={errors}
        />
      ) : (
        <MeetupCfpOpening cfpStart={currentEvent.cfpStart} timezone={currentEvent.timezone} />
      )}

      <CommonCfpSetting
        maxProposals={currentEvent.maxProposals}
        codeOfConductUrl={currentEvent.codeOfConductUrl}
        errors={errors}
      />
    </>
  );
}
