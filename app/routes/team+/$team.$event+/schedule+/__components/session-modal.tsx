import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { Divider } from '~/design-system/divider.tsx';
import SelectNative from '~/design-system/forms/select-native.tsx';
import { IconButton } from '~/design-system/icon-buttons.tsx';
import { Background, ModalTransition } from '~/design-system/transitions.tsx';

import { TimeRangeInput } from './forms/time-range-input.tsx';
import type { Session, TimeSlot, Track } from './schedule/types.ts';

type SessionModalProps = {
  open: boolean;
  session: Session; // TODO: should not be nullable
  startTime: Date;
  endTime: Date;
  tracks: Array<Track>;
  onDeleteSession: (session: Session) => void;
  onUpdateSession: (session: Session, newTrackId: string, newTimeslot: TimeSlot) => void;
  onClose: () => void;
};

export function SessionModal({
  open,
  session,
  startTime,
  endTime,
  tracks,
  onDeleteSession,
  onUpdateSession,
  onClose,
}: SessionModalProps) {
  const [timeslot, setTimeslot] = useState(session.timeslot);
  const [trackId, setTrackId] = useState(session.trackId);

  const handleSave = () => {
    onUpdateSession(session, trackId, timeslot);
    onClose();
  };

  return (
    <Transition show={open}>
      <Dialog className="relative z-40" onClose={onClose}>
        <Background />

        <div className="fixed inset-0 z-40 overflow-y-auto h-full">
          <div className="flex min-h-full items-end justify-center sm:items-center h-full p-4 overflow-hidden">
            <ModalTransition>
              <DialogPanel
                as="div"
                className="relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all w-full max-w-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-end gap-2 px-2 pt-2">
                  <DialogTitle className="sr-only">Edit session</DialogTitle>
                  <IconButton
                    icon={TrashIcon}
                    label="Delete session"
                    onClick={() => session && onDeleteSession(session)}
                    variant="secondary"
                  />
                  <IconButton icon={XMarkIcon} label="Close" onClick={onClose} variant="secondary" />
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <TimeRangeInput
                      startTime={getMinutesFromStartOfDay(timeslot.start)}
                      endTime={getMinutesFromStartOfDay(timeslot.end)}
                      min={getMinutesFromStartOfDay(startTime)}
                      max={getMinutesFromStartOfDay(endTime)}
                      step={5}
                      startRelative
                      onChange={(start, end) => {
                        setTimeslot({
                          start: setMinutesFromStartOfDay(timeslot.start, start),
                          end: setMinutesFromStartOfDay(timeslot.start, end),
                        });
                      }}
                    />
                    <SelectNative
                      name="trackId"
                      label="Track"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      options={tracks.map((t) => ({ name: t.name, value: t.id }))}
                      srOnly
                    />
                  </div>
                </div>

                <Divider />

                {/* Footer */}
                <div className="flex justify-end gap-3 px-4 py-2">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </DialogPanel>
            </ModalTransition>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// TODO: extract
function getMinutesFromStartOfDay(date: Date): number {
  return differenceInMinutes(date, startOfDay(date));
}

// TODO: extract
function setMinutesFromStartOfDay(date: Date, minutes: number): Date {
  return addMinutes(startOfDay(date), minutes);
}
