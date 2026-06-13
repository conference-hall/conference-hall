import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { Background } from '~/design-system/transitions.tsx';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SessionForm } from './session-form.tsx';

type SessionModalProps = {
  mode: 'create' | 'edit';
  session: ScheduleSession;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  scheduleDays: Array<Date>;
  onClose: VoidFunction;
  onSubmit: (session: ScheduleSession) => Promise<boolean>;
  onDelete?: (session: ScheduleSession) => Promise<void>;
};

export function SessionModal({
  mode,
  session,
  displayedTimes,
  tracks,
  scheduleDays,
  onClose,
  onSubmit,
  onDelete,
}: SessionModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog className="relative z-40" open onClose={onClose}>
      <Background />

      <div className="fixed inset-0 z-40 h-full overflow-y-auto">
        <div className="relative flex h-full min-h-full items-end justify-center overflow-hidden p-4 sm:items-center">
          <DialogPanel
            as="div"
            className="text:left relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
          >
            <DialogTitle className="sr-only">{t(`event-management.schedule.${mode}-session.heading`)}</DialogTitle>

            <SessionForm
              mode={mode}
              session={session}
              displayedTimes={displayedTimes}
              tracks={tracks}
              scheduleDays={scheduleDays}
              onFinish={onClose}
              onSubmit={onSubmit}
              onDelete={onDelete}
            />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
