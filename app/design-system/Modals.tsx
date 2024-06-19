import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { IconButton } from './IconButtons.tsx';
import { Text } from './Typography.tsx';

const POSITION = { center: 'sm:items-center', top: 'sm:items-start' };

type Props = { open: boolean } & LayoutProps;

export function Modal({ open, onClose, children, size, position }: Props) {
  return (
    <Transition show={open}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Background />
        <Layout onClose={onClose} size={size} position={position}>
          {children}
        </Layout>
      </Dialog>
    </Transition>
  );
}

// MODAL Title

function Title({ children }: { children: ReactNode }) {
  return (
    <DialogTitle as="h1" className="text-base font-semibold leading-6 text-gray-900">
      {children}
    </DialogTitle>
  );
}

Modal.Title = Title;

// MODAL Subtitle

function Subtitle({ children }: { children: ReactNode }) {
  return <Text variant="secondary">{children}</Text>;
}

Modal.Subtitle = Subtitle;

// Modal Content

function Content({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('pt-4', className)}>{children}</div>;
}

Modal.Content = Content;

// MODAL Actions

function Actions({ children }: { children: ReactNode }) {
  return <div className="pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>;
}

Modal.Actions = Actions;

// MODAL Layout

const layout = cva(
  'relative transform overflow-hidden rounded-lg bg-white text:left shadow-xl transition-all p-4 md:p-8 sm:my-8 sm:w-full',
  {
    variants: {
      size: { m: 'sm:max-w-lg', l: 'sm:max-w-4xl', xl: 'sm:max-w-6xl' },
    },
    defaultVariants: { size: 'm' },
  },
);

type LayoutVariantProps = VariantProps<typeof layout>;

type LayoutProps = {
  onClose: () => void;
  children: React.ReactNode;
  position?: 'top' | 'center';
} & LayoutVariantProps;

function Layout({ position = 'center', size, onClose, children }: LayoutProps) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div className={cx('flex min-h-full items-end justify-center p-4', POSITION[position])}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel className={layout({ size })}>
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <IconButton icon={XMarkIcon} onClick={onClose} label="Close" variant="secondary" />
            </div>
            {children}
          </DialogPanel>
        </TransitionChild>
      </div>
    </div>
  );
}

// MODAL Background

function Background() {
  return (
    <TransitionChild
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-20 transition-opacity" />
    </TransitionChild>
  );
}
