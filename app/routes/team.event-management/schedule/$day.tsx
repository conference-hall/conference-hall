import { parseWithZod } from '@conform-to/zod';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router';
import { EventSchedule } from '~/.server/event-schedule/event-schedule.ts';
import {
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
  ScheduleTracksSaveSchema,
  SchedulSessionIdSchema,
} from '~/.server/event-schedule/event-schedule.types.ts';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n } from '~/libs/i18n/i18n.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { ScheduleHeader } from '../components/schedule-page/header/schedule-header.tsx';
import { useScheduleFullscreen } from '../components/schedule-page/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from '../components/schedule-page/header/use-zoom-handlers.tsx';
import Schedule from '../components/schedule-page/schedule/schedule.tsx';
import { SessionBlock } from '../components/schedule-page/session/session-block.tsx';
import { useDisplaySettings } from '../components/schedule-page/use-display-settings.tsx';
import { useSessions } from '../components/schedule-page/use-sessions.ts';
import type { Route } from './+types/$day.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);

  const schedule = await eventSchedule.getScheduleSessions();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return schedule;
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const eventSchedule = EventSchedule.for(userId, params.team, params.event);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'add-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionCreateSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await eventSchedule.addSession(result.value);
      break;
    }
    case 'update-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionUpdateSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await eventSchedule.updateSession(result.value);
      break;
    }
    case 'delete-session': {
      const result = SchedulSessionIdSchema.safeParse(form.get('id'));
      if (!result.success) return toast('error', t('error.global'));
      await eventSchedule.deleteSession(result.data);
      break;
    }
    case 'update-display-times': {
      const result = parseWithZod(form, { schema: ScheduleDisplayTimesUpdateSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await eventSchedule.update(result.value);
      break;
    }
    case 'save-tracks': {
      const result = parseWithZod(form, { schema: ScheduleTracksSaveSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await eventSchedule.saveTracks(result.value.tracks);
      break;
    }
    case 'delete-schedule': {
      await eventSchedule.delete();
      break;
    }
  }
  return null;
};

export default function ScheduleRoute({ loaderData: schedule }: Route.ComponentProps) {
  const { t } = useTranslation();
  const sessions = useSessions(schedule.sessions, schedule.timezone);
  const settings = useDisplaySettings(schedule);
  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();

  if (settings.displayedDays.length === 0) {
    return (
      <main className="px-8 my-8 mx-auto max-w-7xl">
        <EmptyState icon={CalendarDaysIcon} label={t('event-management.schedule.empty')}>
          <ButtonLink to=".." relative="path">
            {t('event-management.schedule.go-to')}
          </ButtonLink>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className={cx({ 'px-8 my-8 mx-auto max-w-7xl': !isFullscreen })}>
      <h1 className="sr-only">{schedule.name}</h1>

      <div className={cx({ 'border border-gray-200 rounded-t-lg': !isFullscreen })}>
        <ScheduleHeader
          scheduleDays={settings.scheduleDays}
          displayedDays={settings.displayedDays}
          displayedTimes={settings.displayedTimes}
          timezone={schedule.timezone}
          tracks={schedule.tracks}
          zoomHandlers={zoomHandlers}
          onChangeDisplayDays={settings.updateDisplayDays}
          onChangeDisplayTime={settings.updateDisplayTimes}
        />

        <Schedule
          displayedDays={settings.displayedDays}
          displayedTimes={settings.displayedTimes}
          timezone={schedule.timezone}
          tracks={schedule.tracks}
          sessions={sessions.data}
          zoomLevel={zoomHandlers.level}
          onAddSession={sessions.add}
          onUpdateSession={sessions.update}
          onSwitchSessions={sessions.switch}
          renderSession={(session, height) => (
            <SessionBlock
              session={session}
              height={height}
              displayedTimes={settings.displayedTimes}
              tracks={schedule.tracks}
              onUpdateSession={sessions.update}
              onDeleteSession={sessions.delete}
            />
          )}
        />
      </div>
    </main>
  );
}
