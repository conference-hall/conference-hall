// Source: https://github.com/epicweb-dev/epic-stack/blob/main/app/components/error-boundary.tsx

import { type ErrorResponse, isRouteErrorResponse, useParams, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import { Container } from '~/design-system/layouts/Container';
import { H1, Text } from '~/design-system/Typography';

type StatusHandler = (info: { error: ErrorResponse; params: Record<string, string | undefined> }) => JSX.Element | null;

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <>
      <H1>{error.status}</H1>
      <Text>{error.data}</Text>
    </>
  ),
  statusHandlers,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}) {
  const error = useRouteError();
  const params = useParams();

  captureRemixErrorBoundaryError(error);

  if (typeof document !== 'undefined') {
    console.error(error);
  }

  return (
    <Container className="my-4 sm:my-8">
      {isRouteErrorResponse(error) ? (
        (statusHandlers?.[error.status] ?? defaultStatusHandler)({
          error,
          params,
        })
      ) : (
        <Text>{getErrorMessage(error)}</Text>
      )}
    </Container>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  console.error('Unable to get error message for error', error);
  return 'Unknown Error';
}
