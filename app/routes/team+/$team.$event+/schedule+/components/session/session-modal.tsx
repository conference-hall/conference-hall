import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

import { Background } from '~/design-system/transitions.tsx';

import type { ScheduleSession, Track } from '../schedule.types.ts';
import { SessionForm } from './session-form.tsx';

type SessionModalProps = {
  session: ScheduleSession;
  startTime: Date;
  endTime: Date;
  tracks: Array<Track>;
  onClose: () => void;
  onUpdateSession: (current: ScheduleSession, updated: ScheduleSession) => void;
  onDeleteSession: (session: ScheduleSession) => void;
};

export function SessionModal({
  session,
  startTime,
  endTime,
  tracks,
  onClose,
  onUpdateSession,
  onDeleteSession,
}: SessionModalProps) {
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
            <DialogTitle className="sr-only">Edit session</DialogTitle>

            <SessionForm
              session={session}
              startTime={startTime}
              endTime={endTime}
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