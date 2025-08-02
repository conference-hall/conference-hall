import { Dialog, DialogPanel } from '@headlessui/react';
import { useEffect } from 'react';

type CommandPaletteDialogProps = {
  label: string;
  open: boolean;
  onClose: VoidFunction;
  onOpen: VoidFunction;
  withOpenKey?: boolean;
  children: React.ReactNode;
};

export function CommandPaletteDialog({
  label,
  open,
  onClose,
  onOpen,
  withOpenKey,
  children,
}: CommandPaletteDialogProps) {
  useEffect(() => {
    if (!withOpenKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        !open ? onOpen() : onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, withOpenKey, onClose, onOpen]);

  return (
    <Dialog open={open} onClose={onClose} aria-label={label} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel className="mx-auto max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
