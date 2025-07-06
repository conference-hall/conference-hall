import { parseWithZod } from '@conform-to/zod';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { InputTimezone } from '~/design-system/forms/input-timezone.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import { ScheduleCreateSchema } from '~/features/event-management/schedule/services/schedule.schema.server.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { useCurrentEventTeam } from '../event-team-context.tsx';
import type { Route } from './+types/new.ts';
import { EventSchedule } from './services/schedule.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const schedule = await EventSchedule.for(userId, params.team, params.event).get();
  if (schedule) return redirect(`/team/${params.team}/${params.event}/schedule/0`);
  return null;
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

export default function ScheduleRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { event } = useCurrentEventTeam();
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
            <Input name="name" label={t('common.name')} defaultValue={event.name} required error={errors?.name} />
            <InputTimezone name="timezone" label={t('common.timezone')} defaultValue={event.timezone} />
            <DateRangeInput
              start={{ name: 'start', label: t('common.start-date'), value: event.conferenceStart }}
              end={{ name: 'end', label: t('common.end-date'), value: event.conferenceEnd }}
              timezone={event.timezone}
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
