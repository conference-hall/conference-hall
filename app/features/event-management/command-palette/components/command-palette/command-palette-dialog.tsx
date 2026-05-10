import { Dialog, DialogPanel } from '@headlessui/react';
import { useHotkey } from '@tanstack/react-hotkeys';

type CommandPaletteDialogProps = {
  label: string;
  open: boolean;
  onClose: VoidFunction;
  onOpen: VoidFunction;
  children: React.ReactNode;
};

export function CommandPaletteDialog({ label, open, onClose, onOpen, children }: CommandPaletteDialogProps) {
  useHotkey('Mod+K', () => {
    if (open) {
      onClose();
    } else {
      onOpen();
    }
  });

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
