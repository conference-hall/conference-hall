import { parseWithZod } from '@conform-to/zod/v4';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import {
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionUpdateSchema,
  ScheduleTracksSaveSchema,
  SchedulSessionIdSchema,
} from '~/features/event-management/schedule/services/schedule.schema.server.ts';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/schedule.ts';
import { ScheduleHeader } from './components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './components/header/use-zoom-handlers.tsx';
import Schedule from './components/schedule/schedule.tsx';
import { SessionBlock } from './components/session/session-block.tsx';
import { useDisplaySettings } from './components/use-display-settings.tsx';
import { useSessions } from './components/use-sessions.ts';
import { EventSchedule } from './services/schedule.server.ts';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);

  const schedule = await EventSchedule.for(authorizedEvent).getScheduleSessions();
  if (!schedule) return redirect(`/team/${params.team}/${params.event}/schedule`);

  return schedule;
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const i18n = getI18n(context);
  const authorizedEvent = context.get(AuthorizedEventContext);
  const eventSchedule = EventSchedule.for(authorizedEvent);
  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'add-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionCreateSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await eventSchedule.addSession(result.value);
      break;
    }
    case 'update-session': {
      const result = parseWithZod(form, { schema: ScheduleSessionUpdateSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await eventSchedule.updateSession(result.value);
      break;
    }
    case 'delete-session': {
      const result = SchedulSessionIdSchema.safeParse(form.get('id'));
      if (!result.success) return toast('error', i18n.t('error.global'));
      await eventSchedule.deleteSession(result.data);
      break;
    }
    case 'update-display-times': {
      const result = parseWithZod(form, { schema: ScheduleDisplayTimesUpdateSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
      await eventSchedule.update(result.value);
      break;
    }
    case 'save-tracks': {
      const result = parseWithZod(form, { schema: ScheduleTracksSaveSchema });
      if (result.status !== 'success') return toast('error', i18n.t('error.global'));
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
      <main className="mx-auto my-8 max-w-7xl px-8">
        <EmptyState icon={CalendarDaysIcon} label={t('event-management.schedule.empty')}>
          <Button to=".." relative="path">
            {t('event-management.schedule.go-to')}
          </Button>
        </EmptyState>
      </main>
    );
  }

  return (
    <main className={cx({ 'mx-auto my-8 max-w-7xl px-8': !isFullscreen })}>
      <h1 className="sr-only">{schedule.name}</h1>

      <div className={cx({ 'rounded-t-lg border border-gray-200': !isFullscreen })}>
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
