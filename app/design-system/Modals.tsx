import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Fragment } from 'react';

import { IconButton } from './IconButtons';
import { Text } from './Typography';

const POSITION = { center: 'sm:items-center', top: 'sm:items-start' };

type Props = { open: boolean } & LayoutProps;

export function Modal({ open, onClose, children, size, p, position = 'center' }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Background />
        <Layout onClose={onClose} size={size} p={p} position={position}>
          {children}
        </Layout>
      </Dialog>
    </Transition.Root>
  );
}

// MODAL Title

const iconTextColors = { info: 'text-indigo-600', danger: 'text-red-600' };
const iconBgColors = { info: 'bg-indigo-100', danger: 'bg-red-100' };

type ModalTitleProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  iconColor?: keyof typeof iconTextColors;
};

function Title({ icon: Icon, title, description, iconColor = 'info' }: ModalTitleProps) {
  return (
    <div>
      <div className={cx('mx-auto flex h-12 w-12 items-center justify-center rounded-full', iconBgColors[iconColor])}>
        <Icon className={cx('h-6 w-6', iconTextColors[iconColor])} aria-hidden="true" />
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
          {title}
        </Dialog.Title>
        {description && <Text variant="secondary">{description}</Text>}
      </div>
    </div>
  );
}

Modal.Title = Title;

// MODAL Actions

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">{children}</div>;
}

Modal.Actions = Actions;

// MODAL Layout

const layout = cva(
  'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full',
  {
    variants: {
      p: { 0: 'p-0', 4: 'p-4', 8: 'p-8', 10: 'p-10', 16: 'p-16' },
      size: { m: 'sm:max-w-lg', l: 'sm:max-w-4xl', xl: 'sm:max-w-6xl' },
    },
    defaultVariants: { p: 8, size: 'm' },
  },
);

type LayoutVariantProps = VariantProps<typeof layout>;

type LayoutProps = {
  onClose: () => void;
  children: React.ReactNode;
  position?: 'top' | 'center';
} & LayoutVariantProps;

function Layout({ position = 'center', p, size, onClose, children }: LayoutProps) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div className={cx('flex min-h-full items-end justify-center p-4 text-center sm:p-0', POSITION[position])}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <Dialog.Panel className={layout({ p, size })}>
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <IconButton icon={XMarkIcon} onClick={onClose} label="Close" variant="secondary" />
            </div>
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  );
}

// MODAL Background

function Background() {
  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
    </Transition.Child>
  );
}
