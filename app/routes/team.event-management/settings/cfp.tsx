import { parseWithZod } from '@conform-to/zod';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import {
  CfpConferenceOpeningSchema,
  CfpMeetupOpeningSchema,
  CfpPreferencesSchema,
} from '~/.server/event-settings/user-event.types.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { CommonCfpSetting } from '../components/settings-page/common-cfp-setting.tsx';
import { ConferenceCfpOpening } from '../components/settings-page/conference-cfp-opening.tsx';
import { MeetupCfpOpening } from '../components/settings-page/meetup-cfp-opening.tsx';
import type { Route } from './+types/cfp.ts';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const event = UserEvent.for(userId, params.team, params.event);
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
