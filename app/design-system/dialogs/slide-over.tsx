import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { Background, SlideOverTransition } from '../transitions.tsx';

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
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">{children}</div>
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
  title: React.ReactNode;
  children: React.ReactNode;
  onClose: VoidFunction;
  className?: string;
};

function Content({ title, children, onClose, className }: ContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
      <div className="px-4 sm:px-6">
        <div className="flex items-start justify-between">
          <DialogTitle className="text-base font-semibold leading-6 text-gray-900">{title}</DialogTitle>
          <div className="ml-3 flex h-7 items-center">
            <button
              type="button"
              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="absolute -inset-2.5" />
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className={cx('relative mt-6 flex-1 px-4 sm:px-6', className)}>{children}</div>
    </div>
  );
}

SlideOver.Content = Content;

type ActionsProps = { children: React.ReactNode };

function Actions({ children }: ActionsProps) {
  return <div className="flex flex-shrink-0 justify-end gap-4 px-4 py-4">{children}</div>;
}

SlideOver.Actions = Actions;
