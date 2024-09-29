import { ErrorPage } from '../__components/errors/error-page.tsx';
import { NotFound } from '../__components/errors/not-found.tsx';

// Splat routes used to manage POST/PUT/PATCH unknown routes
export async function action() {
  throw new Response(null, { status: 404, statusText: 'Not Found' });
}

// Splat route used to manage GET unknown routes
export default function NotFoundPage() {
  return (
    <ErrorPage>
      <NotFound />
    </ErrorPage>
  );
}
