import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { Background, ModalTransition } from '../transitions.tsx';

const layout = cva(
  'relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all w-full p-4 md:p-8',
  {
    variants: {
      size: { m: 'sm:max-w-lg', l: 'sm:max-w-2xl', full: 'sm:max-w-4xl h-full overflow-y-auto' },
    },
    defaultVariants: { size: 'm' },
  },
);

type Props = {
  title: ReactNode;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
} & VariantProps<typeof layout>;

export function Modal({ title, children, size, open, onClose }: Props) {
  return (
    <Transition show={open}>
      <Dialog className="relative z-40" onClose={onClose}>
        <Background />

        <div className="fixed inset-0 z-40 overflow-y-auto h-full">
          <div className="flex min-h-full items-end justify-center sm:items-center h-full p-4 sm:py-16 overflow-hidden">
            <ModalTransition>
              <DialogPanel as="div" className={layout({ size })}>
                <Title onClose={onClose}>{title}</Title>
                {children}
              </DialogPanel>
            </ModalTransition>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// MODAL Title

function Title({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <DialogTitle as="h1" className="text-base font-semibold leading-6 text-gray-900">
        {children}
      </DialogTitle>
      <div className="md:-mt-4 md:-mr-4 flex h-7 items-center">
        <button
          type="button"
          className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

Modal.Title = Title;

// Modal Content

function Content({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('pt-6', className)}>{children}</div>;
}

Modal.Content = Content;

// MODAL Actions

function Actions({ children }: { children: ReactNode }) {
  return <div className="pt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>;
}

Modal.Actions = Actions;
