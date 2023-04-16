import c from 'classnames';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Text } from '../Typography';

const PADDING = {
  0: 'p-0',
  4: 'p-4',
  8: 'p-8',
  10: 'p-10',
  16: 'p-16',
};

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'm' | 'l' | 'xl';
  position?: 'top' | 'center';
  p?: keyof typeof PADDING;
};

export function Modal({ open, onClose, children, size = 'm', p = 8, position = 'center' }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
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

        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div
            className={c('flex min-h-full items-end justify-center p-4 text-center sm:p-0', {
              'sm:items-center': position === 'center',
              'sm:items-start': position === 'top',
            })}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={c(
                  'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full',
                  PADDING[p],
                  { 'sm:max-w-lg': size === 'm', 'sm:max-w-4xl': size === 'l', 'sm:max-w-6xl': size === 'xl' }
                )}
              >
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

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
      <div className={c('mx-auto flex h-12 w-12 items-center justify-center rounded-full', iconBgColors[iconColor])}>
        <Icon className={c('h-6 w-6', iconTextColors[iconColor])} aria-hidden="true" />
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

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">{children}</div>;
}

Modal.Actions = Actions;
