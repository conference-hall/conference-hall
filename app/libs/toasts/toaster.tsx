import { useEffect } from 'react';
import { toast as showToast, Toaster as SonnerToaster } from 'sonner';

import { type Toast } from './toast.server.ts';

export function Toaster({ toast }: { toast?: Toast | null }) {
  return (
    <>
      <SonnerToaster position="bottom-left" />
      {toast ? <ShowToast toast={toast} /> : null}
    </>
  );
}

function ShowToast({ toast }: { toast: Toast }) {
  const { id, type, title, description } = toast;
  useEffect(() => {
    setTimeout(() => {
      showToast[type](title, { id, description });
    }, 0);
  }, [description, id, title, type]);
  return null;
}
