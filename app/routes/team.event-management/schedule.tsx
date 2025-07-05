import { parseWithZod } from '@conform-to/zod';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleCreateSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { UserEvent } from '~/.server/event-settings/user-event.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { DateRangeInput } from '~/shared/design-system/forms/date-range-input.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { InputTimezone } from '~/shared/design-system/forms/input-timezone.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Page } from '~/shared/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/shared/design-system/typography.tsx';
import type { Route } from './+types/schedule.ts';

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

export default function ScheduleRoute({ loaderData: schedule, actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Page>
      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.schedule.new.heading')}</H2>
          <Subtitle>{t('event-management.schedule.description')}</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form id={formId} method="POST" className="space-y-4 lg:space-y-6">
            <Input name="name" label={t('common.name')} defaultValue={schedule.name} required error={errors?.name} />
            <InputTimezone name="timezone" label={t('common.timezone')} defaultValue={schedule.timezone} />
            <DateRangeInput
              start={{ name: 'start', label: t('common.start-date'), value: schedule.start }}
              end={{ name: 'end', label: t('common.end-date'), value: schedule.end }}
              timezone={schedule.timezone}
              error={errors?.start}
            />
          </Form>
        </Card.Content>
        <Card.Actions>
          <Button type="submit" form={formId}>
            {t('event-management.schedule.new.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </Page>
  );
}
