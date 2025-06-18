import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Background, ModalTransition } from '../transitions.tsx';
import { CloseButton } from './close-button.tsx';

const layout = cva(
  'relative transform overflow-hidden rounded-xl bg-white text:left shadow-xl transition-all w-full p-4 md:p-8',
  {
    variants: {
      size: {
        m: 'sm:max-w-lg',
        l: 'sm:max-w-2xl',
        full: 'sm:max-w-4xl h-full overflow-y-auto',
      },
    },
    defaultVariants: { size: 'm' },
  },
);

type Props = {
  title: ReactNode;
  children: React.ReactNode;
  open: boolean;
  onClose: VoidFunction;
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

function Title({ children, onClose }: { children: ReactNode; onClose: VoidFunction }) {
  return (
    <div className="flex items-start justify-between">
      <DialogTitle as="h1" className="text-base font-semibold leading-6 text-gray-900">
        {children}
      </DialogTitle>
      <CloseButton onClose={onClose} />
    </div>
  );
}

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
