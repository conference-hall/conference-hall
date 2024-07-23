import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import { ErrorPage } from './errors/error-page.tsx';
import { Forbidden } from './errors/forbidden.tsx';
import { InternalServerError } from './errors/internal-server-error.tsx';
import { Maintenance } from './errors/maintenance.tsx';
import { NotFound } from './errors/not-found.tsx';
import { UnexpectedError } from './errors/unexpected-error.tsx';

export function GeneralErrorBoundary() {
  return (
    <ErrorPage>
      <NestedErrorBoundary />
    </ErrorPage>
  );
}

export function NestedErrorBoundary() {
  const error = useRouteError();

  captureRemixErrorBoundaryError(error);

  if (typeof document !== 'undefined') {
    console.error(error);
  }

  if (isRouteErrorResponse(error)) {
    if ([400, 401, 403].includes(error.status)) return <Forbidden text={error.statusText} />;
    if (error.status === 503) return <Maintenance />;
    if (error.status === 500) return <InternalServerError />;

    return <NotFound text={error.statusText} />;
  }

  return <UnexpectedError error={getError(error)} />;
}

function getError(error: unknown | undefined) {
  if (error && error instanceof Error) return error;

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }

  console.error('Unable to get error message for error', error);
  return new Error('Unknown Error');
}
