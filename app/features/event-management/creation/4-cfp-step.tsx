import { parseWithZod } from '@conform-to/zod';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EventCfpConferenceForm } from '~/features/event-management/creation/components/event-cfp-conference-form.tsx';
import { CfpConferenceOpeningSchema } from '~/features/event-management/settings/services/event-settings.schema.server.ts';
import { EventSettings } from '~/features/event-management/settings/services/event-settings.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { EventFetcher } from '../services/event-fetcher.server.ts';
import type { Route } from './+types/4-cfp-step.ts';
import { EventCreationStepper } from './components/event-creation-stepper.tsx';
import { useCurrentTeam } from './team-context.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const event = await EventFetcher.for(userId, params.team, params.event).get();
  if (event.type === 'MEETUP') {
    return redirect(`/team/${params.team}/${params.event}`);
  }
  return event;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const event = EventSettings.for(userId, params.team, params.event);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: CfpConferenceOpeningSchema });
  if (result.status !== 'success') return result.error;
  await event.update(result.value);

  return redirect(href('/team/:team/:event', params));
};

export default function NewEventDetailsRoute({ loaderData: event, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const currentTeam = useCurrentTeam();

  return (
    <>
      <FullscreenPage.Title
        title={t('event-management.new.cfp-form.heading', { eventName: event.name })}
        subtitle={t('event-management.new.cfp-form.description')}
      />

      <EventCreationStepper type={event.type} currentStep={2} />

      <Card>
        <Card.Content>
          <EventCfpConferenceForm
            formId={formId}
            cfpStart={event.cfpStart}
            cfpEnd={event.cfpEnd}
            timezone={event.timezone}
            errors={errors}
          />
        </Card.Content>

        <Card.Actions>
          <ButtonLink
            to={href('/team/:team/:event', { team: currentTeam.slug, event: event.slug })}
            iconLeft={ClockIcon}
            variant="secondary"
          >
            {t('common.do-it-later')}
          </ButtonLink>
          <Button type="submit" form={formId} iconLeft={CheckIcon}>
            {t('common.finish')}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
