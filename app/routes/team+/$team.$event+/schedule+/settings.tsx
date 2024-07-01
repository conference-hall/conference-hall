import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleEditSchema, ScheduleTrackSaveSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { ScheduleDeleteForm } from './__components/schedule-delete-form.tsx';
import { ScheduleEditForm } from './__components/schedule-edit-form.tsx';
import { TracksForm } from './__components/tracks-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const schedule = await EventSchedule.for(userId, params.team, params.event).get();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return json(schedule);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const schedule = EventSchedule.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-track': {
      const result = parseWithZod(form, ScheduleTrackSaveSchema);
      if (!result.success) return json(result.error);
      await schedule.saveTrack(result.value);
      break;
    }
    case 'delete-track': {
      const trackId = String(form.get('id'));
      await schedule.deleteTrack(trackId);
      break;
    }
    case 'edit-schedule': {
      const result = parseWithZod(form, ScheduleEditSchema);
      if (!result.success) return json(result.error);
      await schedule.edit(result.value);
      break;
    }
    case 'delete-schedule': {
      await schedule.delete();
      break;
    }
  }
  return json(null);
};

export default function ScheduleSettingsRoute() {
  const schedule = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page>
      <Page.Heading title={schedule.name}>
        <ButtonLink to=".." variant="secondary" relative="path" iconLeft={ArrowLeftIcon}>
          Back to schedule
        </ButtonLink>
      </Page.Heading>
      <div className="space-y-6">
        <ScheduleEditForm name={schedule.name} errors={errors} />

        <TracksForm tracks={schedule.tracks} />

        <ScheduleDeleteForm />
      </div>
    </Page>
  );
}
