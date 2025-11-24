import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { href, redirect } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EventDetailsForm } from '~/features/event-management/creation/components/event-details-form.tsx';
import { EventDetailsSettingsSchema } from '~/features/event-management/settings/services/event-settings.schema.server.ts';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { EventFetcher } from '../services/event-fetcher.server.ts';
import { EventSettings } from '../settings/services/event-settings.server.ts';
import type { Route } from './+types/3-details-step.ts';
import { EventCreationStepper } from './components/event-creation-stepper.tsx';
import { useCurrentTeam } from './team-context.tsx';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  return EventFetcher.for(authUser.id, params.team, params.event).get();
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authUser = getRequiredAuthUser(context);
  const event = EventSettings.for(authUser.id, params.team, params.event);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: EventDetailsSettingsSchema });
  if (result.status !== 'success') return result.error;

  await event.update(result.value);

  return redirect(href('/team/:team/new/:event/cfp', params));
};

export default function NewEventDetailsRoute({ loaderData: event, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const currentTeam = useCurrentTeam();
  const isConference = event.type === 'CONFERENCE';

  return (
    <>
      <FullscreenPage.Title
        title={t('event-management.new.details-form.heading', { eventName: event.name })}
        subtitle={t('event-management.new.details-form.description')}
      />

      <EventCreationStepper type={event.type} currentStep={1} />

      <Card>
        <Card.Content>
          <EventDetailsForm
            formId={formId}
            type={event.type}
            timezone={event.timezone}
            conferenceStart={event.conferenceStart}
            conferenceEnd={event.conferenceEnd}
            onlineEvent={event.onlineEvent}
            location={event.location}
            description={event.description}
            websiteUrl={event.websiteUrl}
            contactEmail={event.contactEmail}
            errors={errors}
            compact
          />
        </Card.Content>

        <Card.Actions>
          <Button
            to={href('/team/:team/:event', { team: currentTeam.slug, event: event.slug })}
            iconLeft={ClockIcon}
            variant="secondary"
          >
            {t('common.do-it-later')}
          </Button>
          {isConference ? (
            <Button type="submit" form={formId} iconRight={ArrowRightIcon}>
              {t('common.continue')}
            </Button>
          ) : (
            <Button type="submit" form={formId} iconLeft={CheckIcon}>
              {t('common.finish')}
            </Button>
          )}
        </Card.Actions>
      </Card>
    </>
  );
}
