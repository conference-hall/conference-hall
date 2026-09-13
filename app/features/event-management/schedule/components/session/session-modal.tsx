import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { Background } from '~/design-system/transitions.tsx';
import type { ScheduleSession } from '../schedule.types.ts';
import { SessionForm } from './session-form.tsx';

type SessionModalProps = {
  mode: 'create' | 'edit';
  session: ScheduleSession;
  onClose: VoidFunction;
};

export function SessionModal({ mode, session, onClose }: SessionModalProps) {
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

            <SessionForm mode={mode} session={session} onFinish={onClose} />
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
