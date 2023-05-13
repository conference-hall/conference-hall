import { Dialog } from '@headlessui/react';
import c from 'classnames';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export default function FullscreenDialog({ title, description, children, onClose, className }: Props) {
  return (
    <Dialog open={true} onClose={onClose}>
      <Dialog.Panel className={c('absolute top-0 z-30 h-screen w-screen bg-white', className)}>
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {description && <Dialog.Description>{description}</Dialog.Description>}
        {children}
      </Dialog.Panel>
    </Dialog>
  );
}
