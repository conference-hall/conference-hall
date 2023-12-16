import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';

type Props = {
  open: boolean;
  size?: 'base' | 'l';
  onClose: () => void;
  children: React.ReactNode;
};

export default function SlideOver({ open, size = 'base', onClose, children }: Props) {
  return (
    <Dialog as="div" open={open} className="relative z-20" onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Dialog.Panel
              className={cx('pointer-events-auto w-screen', {
                'max-w-lg': size === 'base',
                'max-w-2xl': size === 'l',
              })}
            >
              <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">{children}</div>
            </Dialog.Panel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

type ContentProps = { title: React.ReactNode; children: React.ReactNode; onClose: () => void; className?: string };

function Content({ title, children, onClose, className }: ContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
      <div className="px-4 sm:px-6">
        <div className="flex items-start justify-between">
          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">{title}</Dialog.Title>
          <div className="ml-3 flex h-7 items-center">
            <button
              type="button"
              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="absolute -inset-2.5" />
              <span className="sr-only">Close panel</span>
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
  return <div className="flex flex-shrink-0 justify-end gap-2 px-4 py-4">{children}</div>;
}

SlideOver.Actions = Actions;
