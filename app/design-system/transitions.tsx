import { Transition, TransitionChild } from '@headlessui/react';
import type { ReactNode } from 'react';

type TransitionProps = { show?: boolean; children: ReactNode };

export function MenuTransition({ children }: TransitionProps) {
  return (
    <Transition
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      {children}
    </Transition>
  );
}

export function ModalTransition({ children }: TransitionProps) {
  return (
    <TransitionChild
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enterTo="opacity-100 translate-y-0 sm:scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      {children}
    </TransitionChild>
  );
}

export function SelectTransition({ show, children }: TransitionProps) {
  return (
    <Transition show={show} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
      {children}
    </Transition>
  );
}

export function Background() {
  return <div className="fixed inset-0 z-10 bg-slate-800/20" />;
}
