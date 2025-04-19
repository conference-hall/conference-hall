import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { Background, SlideOverTransition } from '../transitions.tsx';
import { CloseButton } from './close-button.tsx';

type Props = {
  open: boolean;
  size?: 's' | 'm' | 'l' | 'xl';
  onClose: VoidFunction;
  children: React.ReactNode;
};

export function SlideOver({ open, size = 'm', onClose, children }: Props) {
  return (
    <Transition show={open}>
      <Dialog className="relative z-40" onClose={onClose}>
        <Background />

        <div className="fixed inset-0 overflow-hidden z-40">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <SlideOverTransition>
                <DialogPanel
                  className={cx('pointer-events-auto w-screen', {
                    'max-w-sm': size === 's',
                    'max-w-lg': size === 'm',
                    'max-w-2xl': size === 'l',
                    'max-w-4xl': size === 'xl',
                  })}
                >
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl sm:rounded-l-xl">
                    {children}
                  </div>
                </DialogPanel>
              </SlideOverTransition>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

type ContentProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose: VoidFunction;
  className?: string;
};

function Content({ title, children, onClose, className }: ContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
      <div className="flex items-start justify-between px-4">
        {title ? <DialogTitle className="text-base font-semibold leading-6 text-gray-900">{title}</DialogTitle> : null}
        <CloseButton onClose={onClose} />
      </div>
      <div className={cx('relative mt-4 flex-1 px-4', className)}>{children}</div>
    </div>
  );
}

SlideOver.Content = Content;

type ActionsProps = { children: React.ReactNode };

function Actions({ children }: ActionsProps) {
  return <div className="flex shrink-0 justify-end gap-4 px-4 py-4">{children}</div>;
}

SlideOver.Actions = Actions;
