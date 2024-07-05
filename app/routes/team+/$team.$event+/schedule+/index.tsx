import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleCreateSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Button } from '~/design-system/buttons.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { InputTimezone } from '~/design-system/forms/input-timezone.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const schedule = await EventSchedule.for(userId, params.team, params.event).get();

  if (schedule) {
    return redirect(`/team/${params.team}/${params.event}/schedule/0`);
  }

  const event = await UserEvent.for(userId, params.team, params.event).get();

  return json({
    name: `${event.name} schedule`,
    start: event.conferenceStart,
    end: event.conferenceEnd,
    timezone: event.timezone,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const schedule = EventSchedule.for(userId, params.team, params.event);

  const form = await request.formData();
  const result = parseWithZod(form, ScheduleCreateSchema);
  if (!result.success) return json(result.error);

  await schedule.create(result.value);

  return redirect(`/team/${params.team}/${params.event}/schedule`);
};

export default function ScheduleRoute() {
  const schedule = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <Card as="section">
        <Card.Title>
          <H2>New schedule</H2>
          <Subtitle>Create a schedule to plan your conference sessions.</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form id="create-schedule-form" method="POST" className="space-y-4 lg:space-y-6">
            <Input name="name" label="Name" defaultValue={schedule.name} required error={errors?.name} />
            <InputTimezone name="timezone" label="Timezone" defaultValue={schedule.timezone} />
            <DateRangeInput
              start={{ name: 'start', label: 'Start date', value: schedule.start }}
              end={{ name: 'end', label: 'End date', value: schedule.end }}
              timezone={schedule.timezone}
              error={errors?.start}
            />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" form="create-schedule-form">
            New schedule
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
