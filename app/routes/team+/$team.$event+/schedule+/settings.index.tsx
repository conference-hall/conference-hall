import { ChevronRightIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import { ScheduleSettingsDataSchema, ScheduleTrackSaveSchema } from '~/.server/event-schedule/event-schedule.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { redirectWithToast } from '~/libs/toasts/toast.server.ts';
import { parseWithZod } from '~/libs/validators/zod-parser.ts';

import { SettingsForm } from './__components/settings-form.tsx';
import { TracksForm } from './__components/tracks-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const settings = await EventSchedule.for(userId, params.team, params.event).settings();
  return json(settings);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');
  const schedule = EventSchedule.for(userId, params.team, params.event);

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-settings': {
      const result = parseWithZod(form, ScheduleSettingsDataSchema);
      if (!result.success) return json(result.error);
      await schedule.saveSettings(result.value);
      return redirectWithToast(`/team/${params.team}/${params.event}/schedule`, 'success', 'Schedule settings saved.');
    }
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
  }
  return json(null);
};

export default function ScheduleSettingsRoute() {
  const settings = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  if (!settings) return <div>No schedules !</div>;

  return (
    <Page className="flex flex-col">
      <Breadcrumb />
      <TracksForm tracks={settings.tracks} />
      <SettingsForm settings={settings} errors={errors} />
    </Page>
  );
}

function Breadcrumb() {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link to=".." relative="path" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            Schedule
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <Link
              to="."
              relative="path"
              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              aria-current="page"
            >
              Settings
            </Link>
          </div>
        </li>
      </ol>
    </nav>
  );
}
