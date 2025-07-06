import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Background } from '~/design-system/transitions.tsx';
import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SessionForm } from './session-form.tsx';

type SessionModalProps = {
  session: ScheduleSession;
  displayedTimes: { start: number; end: number };
  tracks: Array<Track>;
  onClose: VoidFunction;
  onUpdateSession: (updated: ScheduleSession) => Promise<boolean>;
  onDeleteSession: (session: ScheduleSession) => Promise<void>;
};

export function SessionModal({
  session,
  displayedTimes,
  tracks,
  onClose,
  onUpdateSession,
  onDeleteSession,
}: SessionModalProps) {
  const { t } = useTranslation();
  const [isSearching, setSearching] = useState(false);

  const handleClose = () => {
    if (isSearching) return setSearching(false);
    onClose();
  };

  return (
    <Dialog className="relative z-40" open onClose={handleClose}>
      <Background />

      <div className="fixed inset-0 z-40 overflow-y-auto h-full">
        <div className="flex min-h-full relative items-end justify-center sm:items-center h-full p-4 overflow-hidden">
          <DialogPanel
            as="div"
            className="relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all w-full max-w-2xl"
          >
            <DialogTitle className="sr-only">{t('event-management.schedule.edit-session.heading')}</DialogTitle>

            <SessionForm
              session={session}
              displayedTimes={displayedTimes}
              tracks={tracks}
              isSearching={isSearching}
              onFinish={handleClose}
              onToggleSearch={() => setSearching(!isSearching)}
              onUpdateSession={onUpdateSession}
              onDeleteSession={onDeleteSession}
            />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
