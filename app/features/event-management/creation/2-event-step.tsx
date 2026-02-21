import { parseWithZod } from '@conform-to/zod/v4';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, href, redirect } from 'react-router';
import z from 'zod';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button } from '~/design-system/button.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { AuthorizedTeamContext } from '~/shared/authorization/authorization.middleware.ts';
import type { EventType } from '~/shared/types/events.types.ts';
import type { Route } from './+types/2-event-step.ts';
import { EventCreationStepper } from './components/event-creation-stepper.tsx';
import { EventForm } from './components/event-form.tsx';
import { EventCreateSchema, EventCreation } from './services/event-creation.server.ts';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authorizedTeam = context.get(AuthorizedTeamContext);
  const result = z.enum(['CONFERENCE', 'MEETUP']).safeParse(params.type);
  if (!result.success) return { existingEvents: [] };

  const eventCreation = EventCreation.for(authorizedTeam);
  const existingEvents = await eventCreation.findTemplateEvents(result.data);
  return { existingEvents };
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const authorizedTeam = context.get(AuthorizedTeamContext);
  const form = await request.formData();
  const result = await parseWithZod(form, { schema: EventCreateSchema, async: true });
  if (result.status !== 'success') return result.error;

  const event = await EventCreation.for(authorizedTeam).create(result.value);
  return redirect(href('/team/:team/new/:event/details', { team: params.team, event: event.slug }));
};

export default function NewEventRoute({ params, loaderData, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { existingEvents } = loaderData;
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
          <Form id={formId} method="POST" replace className="flex grow flex-col gap-4 lg:gap-6">
            <EventForm errors={errors} />

            {existingEvents.length > 0 ? (
              <Select
                name="eventTemplateId"
                defaultValue=""
                label={t('event-management.fields.event-template')}
                options={[
                  { value: '', name: t('event-management.fields.event-template-placeholder') },
                  ...existingEvents.map((event) => ({ name: event.name, value: event.id })),
                ]}
              />
            ) : null}

            <input name="type" type="hidden" value={type} />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button to=".." variant="secondary">
            {t('common.go-back')}
          </Button>
          <Button type="submit" form={formId} iconRight={ArrowRightIcon}>
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
