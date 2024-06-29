import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { v4 as uuid } from 'uuid';

import { Page } from '~/design-system/layouts/page.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import type { ScheduleSettings } from './__components/settings-form.tsx';
import { SettingsForm } from './__components/settings-form.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  return null;
};

export default function ScheduleSettingsRoute() {
  const settings: ScheduleSettings = {
    name: 'Devfest Nantes schedule',
    startTime: '09:00',
    endTime: '18:00',
    intervalMinutes: 5,
    tracks: [
      { id: uuid(), name: 'Room 1' },
      { id: uuid(), name: 'Room 2' },
    ],
  };

  return (
    <Page>
      <SettingsForm initialValues={settings} />
    </Page>
  );
}
