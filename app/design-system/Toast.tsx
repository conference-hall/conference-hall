import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { ToastTransition } from './Transitions';
import { IconButton } from './IconButtons';
import { Text } from './Typography';

type Props = { toast?: string };

const TOAST_TIME = 10000;

export function Toast({ toast }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setShow(true);
    const timeout = setTimeout(() => setShow(false), TOAST_TIME);

    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <>
      <div aria-live="assertive" className="pointer-events-none fixed inset-0 z-30 flex items-end px-4 py-6 sm:p-6">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <ToastTransition show={show}>
            <div
              id="toast"
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-1 items-center">
                  <CheckCircleIcon className="h-6 w-6 flex-shrink-0 text-green-400" aria-hidden="true" />
                  <div className="ml-3">
                    <Text size="s" strong>
                      {toast}
                    </Text>
                  </div>
                </div>
                <div className="ml-4">
                  <IconButton variant="secondary" size="s" onClick={() => setShow(false)} icon={XMarkIcon} />
                </div>
              </div>
            </div>
          </ToastTransition>
        </div>
      </div>
    </>
  );
}
