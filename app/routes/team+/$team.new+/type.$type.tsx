import { parseWithZod } from '@conform-to/zod';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import { EventCreateSchema, TeamEvents } from '~/.server/team/team-events.ts';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { FullscreenPage } from '~/routes/components/fullscreen-page.tsx';
import type { EventType } from '~/types/events.types.ts';
import { EventForm } from '../../components/events/event-form.tsx';
import type { Route } from './+types/type.$type.ts';
import { EventCreationStepper } from './components/event-creation-stepper.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = await parseWithZod(form, { schema: EventCreateSchema, async: true });
  if (result.status !== 'success') return result.error;

  const event = await TeamEvents.for(userId, params.team).create(result.value);
  return redirect(href('/team/:team/new/:event/details', { team: params.team, event: event.slug }));
};

export default function NewEventRoute({ params, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const type = (params.type || 'CONFERENCE') as EventType;
  const title =
    type === 'CONFERENCE'
      ? t('event-management.new.event-form.heading.conference')
      : t('event-management.new.event-form.heading.meetup');

  return (
    <>
      <FullscreenPage.Title title={title} subtitle={t('event-management.new.event-form.description')} />

      <EventCreationStepper type={type} currentStep={0} />

      <Card>
        <Card.Content>
          <Form id="create-event-form" method="POST" replace className="flex grow flex-col gap-4 lg:gap-6">
            <EventForm errors={errors} />
            <input name="type" type="hidden" value={type} />
          </Form>
        </Card.Content>

        <Card.Actions>
          <ButtonLink to=".." variant="secondary">
            {t('common.go-back')}
          </ButtonLink>
          <Button type="submit" form="create-event-form" iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
