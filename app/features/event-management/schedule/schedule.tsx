import { parseWithZod } from '@conform-to/zod/v4';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { redirect } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import {
  ScheduleDisplayTimesUpdateSchema,
  ScheduleSessionCreateSchema,
  ScheduleSessionIdSchema,
  ScheduleSessionsSwitchSchema,
  ScheduleSessionUpdateSchema,
  ScheduleTracksSaveSchema,
} from '~/features/event-management/schedule/services/schedule.schema.server.ts';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { setMinutesFromStartOfDay } from '~/shared/datetimes/datetimes.ts';
import { ScheduleTrackRequiredError, SessionConflictError } from '~/shared/errors.server.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/schedule.ts';
import { ScheduleHeader } from './components/header/schedule-header.tsx';
import { useScheduleFullscreen } from './components/header/use-schedule-fullscreen.tsx';
import { useZoomHandlers } from './components/header/use-zoom-handlers.tsx';
import type { ScheduleSession } from './components/schedule.types.ts';
import Schedule from './components/schedule/schedule.tsx';
import { SessionModal } from './components/session/session-modal.tsx';
import { useDisplaySettings } from './components/use-display-settings.tsx';
import { useSessions } from './components/use-sessions.ts';
import { ScheduleTime } from './models/schedule-time.ts';
import { SESSION_INTENTS, SessionMutations } from './models/session-mutation.ts';
import { type CurrentSchedule, ScheduleProvider } from './schedule-context.tsx';
import { EventSchedule } from './services/schedule.server.ts';

const NEW_SESSION_DURATION = 30; // minutes

type EditedSession = { mode: 'create' | 'edit'; session: ScheduleSession };

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

  try {
    switch (intent) {
      case SESSION_INTENTS.add: {
        const result = parseWithZod(form, { schema: ScheduleSessionCreateSchema });
        if (result.status !== 'success') return toast('error', i18n.t('error.global'));
        await eventSchedule.addSession(result.value);
        break;
      }
      case SESSION_INTENTS.update: {
        const result = parseWithZod(form, { schema: ScheduleSessionUpdateSchema });
        if (result.status !== 'success') return toast('error', i18n.t('error.global'));
        await eventSchedule.updateSession(result.value);
        break;
      }
      case SESSION_INTENTS.switch: {
        const result = parseWithZod(form, { schema: ScheduleSessionsSwitchSchema });
        if (result.status !== 'success') return toast('error', i18n.t('error.global'));
        await eventSchedule.switchSessions(result.value.sourceId, result.value.targetId);
        break;
      }
      case SESSION_INTENTS.delete: {
        const result = ScheduleSessionIdSchema.safeParse(form.get('id'));
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
        return { saved: true };
      }
      case 'delete-schedule': {
        await eventSchedule.delete();
        break;
      }
    }
  } catch (error) {
    if (error instanceof SessionConflictError) {
      return toast('error', i18n.t('event-management.schedule.errors.session-conflict'));
    }
    if (error instanceof ScheduleTrackRequiredError) {
      return { errors: { tracks: i18n.t('event-management.schedule.errors.tracks-required') } };
    }
    throw error;
  }
  return null;
};

export default function ScheduleRoute({ loaderData: schedule }: Route.ComponentProps) {
  const { t } = useTranslation();
  const scheduleTime = useMemo(() => new ScheduleTime(schedule.timezone), [schedule.timezone]);
  const sessions = useSessions(schedule.sessions, scheduleTime);
  const settings = useDisplaySettings(schedule, scheduleTime);
  const { isFullscreen } = useScheduleFullscreen();
  const zoomHandlers = useZoomHandlers();
  const [editedSession, setEditedSession] = useState<EditedSession | null>(null);

  const currentSchedule: CurrentSchedule = {
    scheduleTime,
    tracks: schedule.tracks,
    scheduleDays: settings.scheduleDays,
    displayedDays: settings.displayedDays,
    displayedTimes: settings.displayedTimes,
    addSession: sessions.add,
    updateSession: sessions.update,
    deleteSession: sessions.delete,
  };

  const openNewSession = () => {
    const day = settings.displayedDays.at(0);
    const trackId = schedule.tracks.at(0)?.id;
    if (!day || !trackId) return;

    const { start, end } = settings.displayedTimes;
    setEditedSession({
      mode: 'create',
      session: SessionMutations.blank({
        trackId,
        timeslot: {
          start: setMinutesFromStartOfDay(day, start),
          end: setMinutesFromStartOfDay(day, Math.min(start + NEW_SESSION_DURATION, end)),
        },
      }),
    });
  };

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
    <ScheduleProvider value={currentSchedule}>
      <main className={cx({ 'mx-auto my-8 max-w-7xl px-8': !isFullscreen })}>
        <h1 className="sr-only">{schedule.name}</h1>

        <div className={cx({ 'rounded-t-lg border border-gray-200': !isFullscreen })}>
          <ScheduleHeader
            scheduleTime={scheduleTime}
            scheduleDays={settings.scheduleDays}
            displayedDays={settings.displayedDays}
            displayedTimes={settings.displayedTimes}
            tracks={schedule.tracks}
            zoomHandlers={zoomHandlers}
            onChangeDisplayDays={settings.updateDisplayDays}
            onChangeDisplayTime={settings.updateDisplayTimes}
            onNewSession={openNewSession}
          />

          <Schedule
            displayedDays={settings.displayedDays}
            displayedTimes={settings.displayedTimes}
            scheduleTime={scheduleTime}
            tracks={schedule.tracks}
            sessions={sessions.data}
            zoomLevel={zoomHandlers.level}
            onAddSession={sessions.add}
            onMoveSession={sessions.move}
            onResizeSession={sessions.resize}
            onSwapSessions={sessions.swap}
            onOpenSession={(session) => setEditedSession({ mode: 'edit', session })}
          />
        </div>

        {editedSession && (
          <SessionModal
            mode={editedSession.mode}
            session={editedSession.session}
            onClose={() => setEditedSession(null)}
          />
        )}
      </main>
    </ScheduleProvider>
  );
}
