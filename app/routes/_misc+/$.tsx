import { ErrorPage } from '../__components/errors/error-page.tsx';
import { NotFound } from '../__components/errors/not-found.tsx';

// Splat route used to manage all unknown routes
export default function NotFoundPage() {
  return (
    <ErrorPage>
      <NotFound />
    </ErrorPage>
  );
}
