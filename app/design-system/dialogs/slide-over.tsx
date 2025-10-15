import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { Background } from '../transitions.tsx';
import { CloseButton } from './close-button.tsx';

type Props = {
  open: boolean;
  title?: React.ReactNode;
  size?: 's' | 'm' | 'l' | 'xl';
  withBorder?: boolean;
  onClose: VoidFunction;
  children: React.ReactNode;
};

export function SlideOver({ open, title, size = 'm', withBorder = true, onClose, children }: Props) {
  return (
    <Dialog className="z-40" open={open} onClose={onClose}>
      <Background />

      <div className="fixed inset-0 overflow-hidden z-40">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              className={cx('pointer-events-auto w-screen', {
                'max-w-sm': size === 's',
                'max-w-lg': size === 'm',
                'max-w-2xl': size === 'l',
                'max-w-4xl': size === 'xl',
              })}
            >
              <div
                className={cx('flex h-full flex-col bg-white shadow-xl sm:rounded-l-xl', {
                  'divide-y divide-gray-200': withBorder,
                })}
              >
                <div className="z-50">
                  {title ? (
                    <DialogTitle className="text-base font-semibold leading-6 text-gray-900 px-4 py-4">
                      {title}
                    </DialogTitle>
                  ) : null}
                  <CloseButton onClose={onClose} className="self-end" />
                </div>
                {children}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

interface ContentProps<T extends React.ElementType = 'div'> {
  as?: T;
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<React.ComponentRef<T>>;
}

function Content<T extends React.ElementType = 'div'>({ as, children, className, ref }: ContentProps<T>) {
  const Component = (as || 'div') as React.ElementType;
  return (
    <Component ref={ref} className={cx('flex-1 overflow-y-auto h-full p-4', className)}>
      {children}
    </Component>
  );
}

SlideOver.Content = Content;

type ActionsProps = { children: React.ReactNode; className?: string };

function Actions({ children, className }: ActionsProps) {
  return <div className={cx('flex shrink-0 justify-end gap-4 p-4', className)}>{children}</div>;
}

SlideOver.Actions = Actions;
