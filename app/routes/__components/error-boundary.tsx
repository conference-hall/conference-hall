import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import { Forbidden } from './errors/forbidden.tsx';
import { InternalServerError } from './errors/internal-server-error.tsx';
import { NotFound } from './errors/not-found.tsx';

export function GeneralErrorBoundary() {
  const error = useRouteError();

  captureRemixErrorBoundaryError(error);

  if (typeof document !== 'undefined') {
    console.error(error);
  }

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) return <Forbidden />;

    return <NotFound />;
  }

  return <InternalServerError />;
}
