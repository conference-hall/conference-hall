import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef, useState } from 'react';
import type { ToastData } from '~/utils/toasts';
import { ToastTransition } from './Transitions';

type Props = { toast?: ToastData | null };

type Timeout = ReturnType<typeof setTimeout>;

const TOAST_TIME = 5000;

export function Toast({ toast }: Props) {
  const timerRef = useRef<Timeout | null>(null);
  const [show, setShow] = useState(false);
  const { id, message, description } = toast || {};

  useEffect(() => {
    if (!id) return;
    setShow(true);
    timerRef.current = setTimeout(() => setShow(false), TOAST_TIME);
  }, [id]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <div aria-live="assertive" className="pointer-events-none fixed inset-0 z-30 flex items-end px-4 py-6 sm:p-6">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <ToastTransition show={show}>
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{message}</p>
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setShow(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ToastTransition>
        </div>
      </div>
    </>
  );
}
