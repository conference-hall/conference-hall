import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { cva, cx } from 'class-variance-authority';
import { Background, ModalTransition } from '../transitions.tsx';
import { CloseButton } from './close-button.tsx';

const layout = cva(
  'text:left relative w-full transform overflow-hidden rounded-xl bg-white p-4 shadow-xl transition-all md:p-8',
  {
    variants: {
      size: {
        m: 'sm:max-w-lg',
        l: 'sm:max-w-2xl',
        full: 'h-full overflow-y-auto sm:max-w-4xl',
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

        <div className="fixed inset-0 z-40 h-full overflow-y-auto">
          <div className="flex h-full min-h-full items-end justify-center overflow-hidden p-4 sm:items-center sm:py-16">
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
      <DialogTitle as="h1" className="text-base leading-6 font-semibold text-gray-900">
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
  return <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:justify-end">{children}</div>;
}

Modal.Actions = Actions;
