import { parseWithZod } from '@conform-to/zod';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleTrackSaveSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import type { Route } from './+types/settings.ts';
import { ScheduleDeleteForm } from './components/forms/schedule-delete-form.tsx';
import { TracksForm } from './components/forms/tracks-form.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const userId = await requireSession(request);
  const schedule = await EventSchedule.for(userId, params.team, params.event).get();
  if (!schedule) throw redirect(`/team/${params.team}/${params.event}/schedule`);
  return schedule;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const schedule = EventSchedule.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-track': {
      const result = parseWithZod(form, { schema: ScheduleTrackSaveSchema });
      if (result.status !== 'success') return result.error;
      await schedule.saveTrack(result.value);
      break;
    }
    case 'delete-track': {
      const trackId = String(form.get('id'));
      await schedule.deleteTrack(trackId);
      break;
    }
    case 'delete-schedule': {
      await schedule.delete();
      break;
    }
  }
  return null;
};

export default function ScheduleSettingsRoute({ loaderData: schedule }: Route.ComponentProps) {
  return (
    <Page>
      <Page.Heading title={schedule.name}>
        <ButtonLink to=".." variant="secondary" relative="path" iconLeft={ArrowLeftIcon}>
          Back to schedule
        </ButtonLink>
      </Page.Heading>
      <div className="space-y-6">
        <TracksForm tracks={schedule.tracks} />

        <ScheduleDeleteForm />
      </div>
    </Page>
  );
}
