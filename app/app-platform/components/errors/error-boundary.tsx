import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ErrorPage } from './error-page.tsx';
import { Forbidden } from './forbidden.tsx';
import { InternalServerError } from './internal-server-error.tsx';
import { Maintenance } from './maintenance.tsx';
import { NotFound } from './not-found.tsx';
import { UnexpectedError } from './unexpected-error.tsx';

export function GeneralErrorBoundary() {
  return (
    <ErrorPage>
      <NestedErrorBoundary />
    </ErrorPage>
  );
}

export function NestedErrorBoundary() {
  const error = useRouteError();

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
