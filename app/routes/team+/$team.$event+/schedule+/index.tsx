import { parseWithZod } from '@conform-to/zod';
import { redirect } from 'react-router';
import { Form } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleCreateSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { Button } from '~/design-system/buttons.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { InputTimezone } from '~/design-system/forms/input-timezone.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import type { Route } from './+types/index.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const schedule = await EventSchedule.for(userId, params.team, params.event).get();
  if (schedule) return redirect(`/team/${params.team}/${params.event}/schedule/0`);

  const event = await UserEvent.for(userId, params.team, params.event).get();
  return {
    name: `${event.name} schedule`,
    start: event.conferenceStart,
    end: event.conferenceEnd,
    timezone: event.timezone,
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const schedule = EventSchedule.for(userId, params.team, params.event);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: ScheduleCreateSchema });
  if (result.status !== 'success') return result.error;

  await schedule.create(result.value);
  return redirect(`/team/${params.team}/${params.event}/schedule`);
};

// todo(i18n): translate schedule
export default function ScheduleRoute({ loaderData: schedule, actionData: errors }: Route.ComponentProps) {
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
