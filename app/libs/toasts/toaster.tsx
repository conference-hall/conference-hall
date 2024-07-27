import { useEffect } from 'react';
import { toast as showToast, Toaster as SonnerToaster } from 'sonner';

import { type Toast } from './toast.server.ts';

export function Toaster({ toast }: { toast?: Toast | null }) {
  return (
    <>
      <SonnerToaster
        position="top-center"
        offset="12px"
        gap={5}
        visibleToasts={1}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'flex items-center gap-2 text-sm rounded-md shadow-lg px-4 py-2 w-full -mt-2 sm:mt-0',
            error: 'text-red-500 border border-red-300 bg-red-50',
            success: 'text-green-500 border border-green-300 bg-green-50',
            warning: 'text-yellow-500 border border-yellow-300 bg-yellow-50',
            info: 'text-info-500 border border-gray-200 bg-white',
            title: 'text-gray-900',
            description: 'text-gray-900',
            closeButton: 'right-0',
          },
        }}
      />
      {toast ? <ShowToast toast={toast} /> : null}
    </>
  );
}

function ShowToast({ toast }: { toast: Toast }) {
  const { id, type, title } = toast;
  useEffect(() => {
    setTimeout(() => {
      showToast[type](title, { id });
    }, 0);
  }, [id, title, type]);
  return null;
}
